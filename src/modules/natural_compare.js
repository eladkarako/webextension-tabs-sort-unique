"use strict";

const natural_compare = (a, b)=>{
  let ax=[]
     ,bx=[]
     ;
  if("function" === typeof natural_compare.extraction_rule){
    a = natural_compare.extraction_rule(a);
    b = natural_compare.extraction_rule(b);
  }
//    if("number" === typeof a && "number" === typeof b) return b-a;

  if("object" === typeof a){ return  1; }
  if("object" === typeof b){ return -1; }

  if("boolean" === typeof a){ a = !!a ? 1 : 0;}
  if("boolean" === typeof b){ b = !!b ? 1 : 0;}

  a = String(a);
  b = String(b);

  a.replace(/(\d+)|(\D+)/g, function(_, $1, $2){ ax.push([$1 || Infinity, $2 || ""]); });
  b.replace(/(\d+)|(\D+)/g, function(_, $1, $2){ bx.push([$1 || Infinity, $2 || ""]); });

  for(let an, bn, nn;  ax.length > 0 && bx.length > 0 ;){
    an = ax.shift();
    bn = bx.shift();
    nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if(nn) return nn;
  }
  return ax.length - bx.length;
};


export { natural_compare };