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

  const [tabs_all, other_windows] = await Promise.all([api.tabs.query({}), api.windows.getAll({})]);  //at this point in time the "new window" hasn't been created yes.

  const tabs_unique = {};
  tabs_all.forEach(tab=>{
    const key = normalize_url(tab.url);
    tabs_unique[key] = tab;
  });

  const ids_tabs = Object.keys(tabs_unique)         //pre-extract keys (which are urls slightly normalized)
                   .sort(natural_compare)           //pre-sort by the keys
                   .map(key=>tabs_unique[key].id)   //extract a tab base on its url, in sorted order, get its id.
                   ;


  create_data.tabId = ids_tabs[0]; //create window without new-tab page needs at least one real tab, using the id of the first tab in the sorted array of unique tabs that would be moving to it anyway. move function will run again and won't do much for the first one.
  const w           = await api.windows.create(create_data);
  await api.windows.update(w.id, update_info);                                    //make the window focused and maximized before moving tabs, since window resize trigger reflow.
  await api.tabs.move(ids_tabs, {index:-1, windowId:w.id});                       //move unique tabs to new window.
  await api.tabs.update(ids_tabs[0], {active:true});                              //normalize to only make the first tab active.
  await api.tabs.update(ids_tabs[0], {active:true});                              //normalize to only make the first tab active.

  return Promise.allSettled(other_windows.map(ww => api.windows.remove(ww.id)));  //close all other windows (and their tabs).
};


api.action.onClicked.addListener(click_handler);


void 0;