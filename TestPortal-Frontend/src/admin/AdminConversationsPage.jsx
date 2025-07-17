import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState([]);
  useEffect(() => {
    fetch("/api/v1/conversations")
      .then(res => res.json())
      .then(setConversations);
  }, []);
  return (
    <div>
      <h2>All Conversations</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>User</th><th>Test</th><th>Title</th><th>Started</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map(conv => (
            <tr key={conv.id}>
              <td>{conv.id}</td>
              <td>{conv.user?.email || conv.user_id}</td>
              <td>{conv.test?.title || conv.test_id}</td>
              <td>{conv.title}</td>
              <td>{new Date(conv.created_at).toLocaleString()}</td>
              <td><Link to={`/admin/conversations/${conv.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 