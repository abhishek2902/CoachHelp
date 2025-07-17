import React, { useEffect, useState } from 'react';
import { BadgeCheck, ShoppingBag } from 'lucide-react';
import FlashMessage from './FlashMessage';
import { LoaderCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPlans } from '../services/plans';
import { useCurrency } from '../context/CurrencyContext';

const GST_RATE = 0.18;

const Plans = ({userCountry, setActiveTab}) => {

  const [flash, setFlash]=useState();
  const [gstApplicable, setGstApplicable] = useState(userCountry && userCountry.toUpperCase() === 'IN');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();
  const { userCurrency, formatPrice } = useCurrency();

  useEffect(() => {
    setGstApplicable(userCountry && userCountry.toUpperCase() === 'IN');
  }, [userCountry]);

  useEffect(() => {
    setLoading(true)
    fetchPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  const getDisplayPrice = (plan) => {
    // Use converted price if available, otherwise use original price
    if (plan.converted_price && userCurrency !== 'INR') {
      return plan.converted_price;
    }
    return plan.price;
  };

  const getDisplayPriceFormatted = (plan) => {
    if (plan.converted_price && userCurrency !== 'INR') {
      return formatPrice(plan.converted_price, userCurrency);
    }
    return formatPrice(plan.price, 'INR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (<>
  {flash && (
            <FlashMessage
              message={flash.message}
              type={flash.type}
              onClose={() => setFlash(null)}
              time={2000}
            />
          )}

    
  
  <Link
  onClick={() => setActiveTab("My Plans")}
  className="
    inline-block
    px-6
    py-3
    mt-4
    bg-gradient-to-r from-purple-600 via-pink-500 to-red-500
    text-white
    font-semibold
    rounded-lg
    shadow-lg
    hover:from-pink-500 hover:to-purple-600
    transition
    duration-300
    ease-in-out
    transform
    hover:scale-105
    focus:outline-none
    focus:ring-4
    focus:ring-pink-300
  "
>
  View My Plans
</Link>


   <div className='pt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-6 relative'>
  {plans.map(plan => {
    const baseAmount = Number(getDisplayPrice(plan));
    let gst = gstApplicable ? +(baseAmount * GST_RATE).toFixed(2) : 0;
    let total = gstApplicable ? +(baseAmount + gst).toFixed(2) : baseAmount;
    return (
    <div
  key={plan.id}
  className='relative overflow-hidden p-6 bg-white shadow-lg rounded-2xl border border-gray-200 hover:border-green-500 transition-all duration-300 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200'
>
  {/* Decorative Icon */}
        <div className="absolute -top-10 -right-10 opacity-10 rotate-12 pointer-events-none">
          <BadgeCheck className="w-48 h-48 text-green-300" />
        </div>

  {/* Validity Badge */}
  <span className={`absolute top-3 right-3 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full`}>
    {plan.interval} Days
  </span>

  {/* Most Popular Badge */}
  {plan.name.toLowerCase().includes('premium') && (
    <span className='absolute top-3 left-3 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full'>
      Most Popular
    </span>
  )}

  {/* Plan Title */}
  <h2 className='text-2xl font-bold text-gray-800 mb-1'>{plan.name}</h2>

  {/* Plan Price & GST Breakdown */}
  <div className='mb-4'>
    <div className='text-lg text-gray-800'>Base Price: {getDisplayPriceFormatted(plan)}</div>
    {gstApplicable && <div className='text-sm text-gray-600'>GST (18%): {formatPrice(gst, userCurrency)}</div>}
    <div className='text-xl font-bold text-green-700'>Total: {formatPrice(total, userCurrency)}</div>
    {userCurrency !== 'INR' && plan.converted_price && (
      <div className='text-xs text-gray-500 mt-1'>
        Original: ₹{plan.price}
      </div>
    )}
  </div>

  {/* Plan Description (One line) */}
  <p className='text-sm text-gray-600 mb-4'>{plan.description}</p>

  {/* Features List */}
  <ul className="text-sm text-gray-600 space-y-2 mb-6">
    {plan.features.split(",").map((feature, idx) => (
      <li key={idx} className='flex items-center gap-2'>
        <BadgeCheck className='w-4 h-4 text-green-500' />
        {feature}
      </li>
    ))}
  </ul>

  {/* Buy Button */}
  <button
    className="absolute bottom-0 left-0 block w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-b-lg transition flex justify-center items-center gap-2"
    onClick={() => navigate('/checkout', { state: { plan: { ...plan, gst: gstApplicable ? gst : 0 } } })}
  >
    <ShoppingBag className="w-4 h-4" /> Buy Now
  </button>
</div>
    );
  })}
</div>


    </>
  );
};

export default Plans;