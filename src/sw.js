"use strict";


import { natural_compare } from './modules/natural_compare.js';
import { normalize_url   } from './modules/normalize_url.js';


const api         = ("undefined" !== typeof chrome ? chrome : ("undefined" !== typeof browser ? browser : {runtime:{lastError:true}}))
     ,create_data = {focused : false
                    ,type    : api.windows.CreateType.NORMAL
                    ,state   : api.windows.WindowState.NORMAL //when focus==false, you can only use NORMAL here.
                    ,height  : 500
                    ,width   : 800
                    ,top     : 10
                    ,left    : 10
                    }
     ,update_info = {focused : true
                    ,state   : api.windows.WindowState.MAXIMIZED
                    }
     ;


const startup_handler = async ()=>{
  if("undefined" !== typeof api.runtime.lastError && null !== api.runtime.lastError){
    const error = api.runtime.lastError.message;
    throw error;
  }

  return true;
};

api.runtime.onStartup.addListener(startup_handler);
api.runtime.onInstalled.addListener(startup_handler);




const click_handler = async ()=>{
  if("undefined" !== typeof api.runtime.lastError && null !== api.runtime.lastError){
    const error = api.runtime.lastError.message;
    throw error;
  }

  await api.action.disable(); //disable the button until job is done

  const tabs_all          = await api.tabs.query({});

  let tabs = tabs_all.reduce((carry,current,index,array)=>{
               const key = normalize_url(current.url);
               carry[key] = current;
               return carry;
             },{});

  tabs = Object.keys(tabs)
               .sort(natural_compare)
               .map(key=>tabs[key]);

  create_data.tabId   = tabs[0].id                                                             //windows with actual tab instead of start page or new tab page. removing first id from moving tabs as well.
  const other_windows = await api.windows.getAll({});                                          //still have not created the new window, in the next line, this result will show other window, without the new window. this way no need to filter windows and exclude the new window id.
  const w             = await api.windows.create(create_data);                                 //create new window (to ease up closing other tabs by closing their window).
  await api.windows.update(w.id, {focused:false, state:api.windows.WindowState.MINIMIZED});    //unfocused and minimized means it takes less RAM.

  await Promise.allSettled(tabs.map(tab=>api.tabs.move(tab.id, {index:-1, windowId:w.id})));   //parallel move every single tab, to new window. order is not important.
  for(let i=0; i<tabs.length; i+=1){                                                           //re-order, based on the order in the array.
    await api.tabs.move(tabs[i].id, {index:i, windowId:w.id});
  }

  await api.tabs.update(create_data.tabId, {active:true});                                     //normalize active tab to first one.
  await api.windows.update(w.id, {focused:true, state:api.windows.WindowState.MAXIMIZED});     //work done for this window. time to make it "visible" which will take more RAM..

  await Promise.allSettled(other_windows.map(ww => api.windows.remove(ww.id)));                //close all other windows (and their tabs).
  await api.action.enable(); //re-enable the button since job is done.
  return true;
};


api.action.onClicked.addListener(click_handler);


void 0;