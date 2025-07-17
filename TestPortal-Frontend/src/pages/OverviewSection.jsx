import React, { useEffect, useState } from 'react';
import { Frown, LoaderCircle, Smartphone, UserRoundCheck } from 'lucide-react';
import { BadgeCheck, CalendarCheck, ClipboardList ,Mail,Building2, CircleFadingArrowUp} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SubscriptionList from '../components/SubscriptionList'


const OverviewSection = ({account,setActiveTab,subscriptions}) => {
  // console.log(account)

  if (!account.user) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="w-10 h-10 text-gray-500 animate-spin" />
      </div>
    );}

  // dayjs.extend(relativeTime);
  // const endDate = dayjs(subscription&&subscription.end_date);  

  return (<>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <div className="p-6 bg-white shadow-md rounded-lg bg-gradient-to-r from-gray-50 via-white to-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Profile</h2>
        </div>
        <div className="flex items-center space-x-5">
          <img
            src={account.user.profile_picture_url || "https://freesvg.org/img/abstract-user-flat-3.png"}
            alt="Profile"
            className="w-20 h-20 rounded-xl object-cover border-4 border-gray-300 shadow-md"
          />
          <div className="flex flex-col justify-center space-y-5">
            <div className="flex items-center space-x-2 min-w-0">
              <UserRoundCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <h3
                className="text-base font-medium text-gray-800 truncate"
                title={
                  account.user.first_name || account.user.last_name
                    ? `${account.user.first_name ?? ''} ${account.user.last_name ?? ''}`.trim()
                    : "Unnamed User"
                }
              >
                {account.user.first_name || account.user.last_name
                  ? `${account.user.first_name ?? ''} ${account.user.last_name ?? ''}`.trim()
                  : "Unnamed User"}
              </h3>
              <span className="text-xs px-2 py-1 bg-gray-100 text-purple-600 rounded-full font-medium uppercase flex-shrink-0">
                {account.user.admin ? "admin" : "user"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <span>{account.user.mobile_number}</span>
            </div>
          </div>
        </div>
      </div>


      <div className="p-6 bg-white shadow-md rounded-lg bg-gradient-to-r from-gray-50 via-white to-gray-100">
        <div className="flex flex-col items-start space-x-4">
        <h1 className="text-xl font-semibold mb-2">Contacts</h1>
          <div className='mt-3'>
            <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-500"/>
              <h2 className="text-sm  ">Email: {account.user.email}</h2>
            </div>
            <br></br>
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-purple-500"/>
              <h2 className="text-sm  ">Organization: {account.user.organization?.name}</h2>
            </div>
          </div>
        </div>        
      </div>
      
    </div>


    
<SubscriptionList className="mt-4" subscriptions={subscriptions} setActiveTab={setActiveTab}/>

    </>
  );
};

export default OverviewSection;
