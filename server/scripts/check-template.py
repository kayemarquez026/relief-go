from html.parser import HTMLParser
from pathlib import Path
class Checker(HTMLParser):
    void={'input','img','br','hr','meta','link','source','area'}
    def __init__(self):super().__init__(convert_charrefs=True);self.stack=[];self.errors=[]
    def handle_starttag(self,tag,attrs):
        if tag not in self.void:self.stack.append(tag)
    def handle_startendtag(self,tag,attrs):pass
    def handle_endtag(self,tag):
        if tag in self.void:return
        if not self.stack:self.errors.append(f'extra closing {tag}');return
        if self.stack[-1]!=tag:self.errors.append(f'expected closing {self.stack[-1]}, found {tag}');return
        self.stack.pop()
root=Path(__file__).resolve().parents[2]/'src'
for p in sorted(root.rglob('*.vue')):
    s=p.read_text();part=s.split('<script setup',1)[0]
    c=Checker();c.feed(part)
    print(p.name,'OK' if not c.errors and not c.stack else 'ERROR '+str(c.errors[:6])+' open '+str(c.stack[-6:]))
