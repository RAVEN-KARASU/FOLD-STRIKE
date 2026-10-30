"""Same LAN controller protocol as desktop/LocalControllers.cs; standard library only."""
import json,secrets,socket,time,threading,ipaddress
from urllib.parse import urlsplit,parse_qs
ACTIONS=set('left right up down lpunch punch hpunch lkick kick hkick special super block start back'.split())
def network_adapters():
    addresses=[]
    for v in socket.getaddrinfo(socket.gethostname(),None,socket.AF_INET):
        ip=v[4][0]
        if ipaddress.ip_address(ip).is_private and not ip.startswith(('127.','169.254.')) and ip not in addresses:addresses.append(ip)
    return dict(addresses=addresses,adapters=[dict(ip=ip,name='Red local / USB (selección manual)',usbHint=False) for ip in addresses])
class Room:
    def __init__(self):self.lock=threading.Lock();self.owner='';self.host_at=0;self.events=[];self.cursor=0;self.slots=[];self.phase=''
    def set(self,i,buttons):
        old=self.slots[i]['buttons']
        for action,down in [(a,False) for a in old-buttons]+[(a,True) for a in buttons-old]:
            self.cursor+=1;self.events.append(dict(id=self.cursor,slot=i,action=action,down=down))
        self.events=self.events[-256:];self.slots[i]['buttons']=buttons
    def handle(self,path,method,body,local,port):
        with self.lock:
            try:return self._handle(path,method,body,local,port)
            except (ValueError,TypeError,KeyError):return 400,{}
    def _handle(self,path,method,body,local,port):
        route=urlsplit(path).path;q=parse_qs(urlsplit(path).query);now=time.monotonic();d=json.loads(body) if body else {}
        if not isinstance(d,dict):return 400,{}
        if route=='/api/local/create':
            if not local or method!='POST':return 403,{}
            self.owner=secrets.token_hex(24);self.host_at=now;self.cursor=0;self.events=[];self.phase='Preparando combate'
            self.slots=[dict(token=secrets.token_hex(24),client='',seq=-1,seen=0,buttons=set()) for _ in range(2)]
            return 200,dict(owner=self.owner,tokens=[s['token'] for s in self.slots],port=port,**network_adapters())
        reconnect=bool(self.owner) and now-self.host_at>12 and route=='/api/local/poll' and local and q.get('owner',[''])[0]==self.owner
        if reconnect:
            self.events=[]
            for i,slot in enumerate(self.slots):self.set(i,set());slot['seen']=0
        if not self.owner or (now-self.host_at>12 and not reconnect):return 410,dict(error='La sala se cerró. Escanea el nuevo QR.')
        if route=='/api/local/adapters':
            if not local or q.get('owner',[''])[0]!=self.owner:return 403,{}
            if method!='GET':return 405,{}
            return 200,network_adapters()
        if route in ['/api/local/poll','/api/local/stop']:
            if not local or q.get('owner',[''])[0]!=self.owner:return 403,{}
            if route.endswith('stop'):
                if method!='POST':return 405,{}
                self.owner='';self.slots=[];self.events=[];return 200,{}
            self.host_at=now;self.phase=q.get('phase',[self.phase])[0];since=int(q.get('since',['0'])[0]);states=[]
            for i,s in enumerate(self.slots):
                age=now-s['seen'];live=age<3
                if age>.75 and s['buttons']:self.set(i,set())
                states.append(dict(connected=live,buttons=sorted(s['buttons'])))
            return 200,dict(cursor=self.cursor,events=[e for e in self.events if e['id']>since],slots=states)
        if route=='/api/local/input' and method=='POST':
            index=next((i for i,s in enumerate(self.slots) if s['token']==d.get('token')),None)
            if index is None:return 403,{}
            slot=self.slots[index];client=d.get('client','');seq=d.get('seq');buttons=d.get('buttons')
            if not isinstance(client,str) or not 8<=len(client)<=80 or not isinstance(seq,int):return 400,{}
            if slot['client']!=client and now-slot['seen']<2:return 409,dict(error='Este jugador ya tiene un teléfono conectado.')
            frames=d.get('frames',[dict(seq=seq,buttons=buttons)])
            if not isinstance(frames,list) or not 1<=len(frames)<=12:return 400,{}
            for frame in frames:
                if not isinstance(frame,dict) or not isinstance(frame.get('seq'),int):return 400,{}
                values=frame.get('buttons')
                if not isinstance(values,list) or len(values)>15 or any(not isinstance(a,str) or a not in ACTIONS for a in values):return 400,{}
            if slot['client']!=client:slot['client']=client;slot['seq']=-1;self.set(index,set())
            for frame in frames:
                if frame['seq']>slot['seq']:slot['seq']=frame['seq'];slot['seen']=now;self.set(index,set(frame['buttons']))
            return 200,dict(slot=index,phase=self.phase,accepted=slot['seq'])
        return 404,{}
ROOM=Room()
