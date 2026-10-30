"""Local static game server with byte-range support for the supplied music."""
import argparse,functools,http.server,os,re,json,sys,ipaddress
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from local_controllers import ROOM

class GameHandler(http.server.SimpleHTTPRequestHandler):
    def local_api(self):
        local=ipaddress.ip_address(self.client_address[0]).is_loopback
        host=self.headers.get('Host','');origin=self.headers.get('Origin','')
        try:length=int(self.headers.get('Content-Length','0'))
        except ValueError:length=-1
        admin=self.path.split('?')[0]!='/api/local/input'
        if (admin and (not local or not host.startswith(('127.0.0.1:','localhost:')))) or (origin and origin!='http://'+host) or length<0 or length>4096 or (self.command=='POST' and not self.headers.get('Content-Type','').startswith('application/json')):
            self.send_error(403);return
        body=self.rfile.read(length).decode('utf-8')
        status,result=ROOM.handle(self.path,self.command,body,local,self.server.server_port)
        payload=json.dumps(result,ensure_ascii=False).encode('utf-8');self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
    def do_POST(self):
        if self.path.startswith('/api/local/'):return self.local_api()
        self.send_error(405)
    def do_GET(self):
        if self.path.startswith('/api/local/'):return self.local_api()
        return super().do_GET()
    def send_head(self):
        self.remaining=None
        if not ipaddress.ip_address(self.client_address[0]).is_loopback and self.path.split('?')[0] not in ['/controller.html','/controller.js','/controller.css','/icon.svg']:
            self.send_error(403);return None
        path=self.translate_path(self.path)
        if not os.path.isfile(path) or not self.headers.get('Range'):
            return super().send_head()
        size=os.path.getsize(path)
        match=re.fullmatch(r'bytes=(\d*)-(\d*)',self.headers['Range'].strip())
        if not match or not any(match.groups()):
            self.send_error(416,'Unsupported byte range');return None
        start,end=match.groups()
        if not start:
            start=max(0,size-int(end));end=size-1
        else:
            start=int(start);end=min(int(end),size-1) if end else size-1
        if start>=size or end<start:
            self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.send_header('Content-Length','0');self.end_headers();return None
        try:f=open(path,'rb')
        except OSError:self.send_error(404);return None
        self.remaining=end-start+1;f.seek(start)
        self.send_response(206);self.send_header('Content-Type',self.guess_type(path));self.send_header('Accept-Ranges','bytes')
        self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.send_header('Content-Length',str(self.remaining));self.end_headers();return f

    def copyfile(self,source,outputfile):
        try:
            if self.remaining is None:return super().copyfile(source,outputfile)
            remaining=self.remaining
            while remaining:
                data=source.read(min(65536,remaining))
                if not data:break
                outputfile.write(data);remaining-=len(data)
        except (ConnectionResetError,ConnectionAbortedError,BrokenPipeError):
            pass  # Browsers cancel media preloads when a scene changes.

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8000);parser.add_argument('--bind',default='127.0.0.1');args=parser.parse_args()
    root=Path(__file__).resolve().parent
    handler=functools.partial(GameHandler,directory=str(root))
    with http.server.ThreadingHTTPServer((args.bind,args.port),handler) as server:
        print(f'FOLD//STRIKE: http://{args.bind}:{args.port}',flush=True)
        try:server.serve_forever()
        except KeyboardInterrupt:pass
if __name__=='__main__':main()
