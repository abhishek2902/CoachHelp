import React, { useEffect, useState } from 'react';
import { fetchSubscriptions, cancelSubscription } from '../services/subscriptions';
import Swal from 'sweetalert2';

const SubscriptionsPage = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubscriptions = async () => {
    try {
      const data = await fetchSubscriptions();
      setSubs(data);
      console.log(data)
    } catch (err) {
      console.error(err);
      setError('Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await cancelSubscription(id);
      Swal.fire('Subscription canceled.');
      loadSubscriptions();
    } catch (err) {
      console.error(err);
      Swal.fire('Failed to cancel subscription.');
    }
  };

  if (loading) return <p>Loading subscriptions…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Your Subscriptions</h1>
      {subs.length > 0 ? (
        subs.map((sub) => (
          <div
            key={sub.id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              margin: '1rem 0',
              borderRadius: '8px',
              background: '#f9f9f9',
            }}
          >
            <p>
              <strong>Plan:</strong> {sub.plan?.name || 'Unknown Plan'}
            </p>
            {sub.plan && (
              <p>
                <strong>Price:</strong> ₹{sub.plan.price} / {sub.plan.interval}
              </p>
            )}
            <p>
              <strong>Status:</strong> {sub.status}
            </p>
            <p>
              <strong>Period:</strong>{' '}
              {sub.start_date
                ? new Date(sub.start_date).toLocaleDateString()
                : 'N/A'}{' '}
              –{' '}
              {sub.end_date
                ? new Date(sub.end_date).toLocaleDateString()
                : 'N/A'}
            </p>
            {sub.metadata?.tests_allowed && (
              <p>
                <strong>Tests allowed:</strong> {sub.metadata.tests_allowed}
              </p>
            )}
            <button
              onClick={() => handleCancel(sub.id)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'crimson',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel Subscription
            </button>
            {/**/}
          </div>
        ))
      ) : (
        <div>
          <p>No subscriptions found.</p>
          <button
            onClick={() => (window.location.href = '/checkout')}
            style={{
              padding: '0.75rem 1.25rem',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Available Plans
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
