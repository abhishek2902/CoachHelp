// src/pages/admin/Dashboard.jsx
import React from 'react';

export function AdminHello() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, admin. Select a section from the sidebar to manage the system.</p>
    </div>
  );
}


// src/pages/admin/Tests.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Tests() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    axios.get('/admin/tests', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setTests(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Tests</h1>
      <div className="grid gap-4">
        {tests.map(test => (
          <div key={test.id} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="font-semibold text-lg">{test.title}</h2>
            <p className="text-sm text-gray-600">{test.description}</p>
            <p className="text-xs text-gray-500">By: {test.user?.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// src/pages/admin/Questions.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Questions() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axios.get('/admin/questions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setQuestions(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Questions</h1>
      <div className="grid gap-4">
        {questions.map(q => (
          <div key={q.id} className="p-4 border rounded shadow-sm bg-white">
            <p className="text-md font-semibold">{q.content}</p>
            <p className="text-sm text-gray-600">Type: {q.question_type}</p>
            <p className="text-sm text-gray-500">Test: {q.test?.title} by {q.test?.user?.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// src/pages/admin/Users.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <table className="w-full text-left border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.admin ? 'Admin' : 'User'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
