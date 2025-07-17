import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function HelpList() {
  const [helps, setHelps] = useState([]);

  useEffect(() => {
    axios.get('/api/helps').then(res => setHelps(res.data));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Help Center</h1>
      {helps.map(help => (
        <div key={help.id} className="mb-8 bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">{help.title}</h2>
          <p className="mb-3 text-gray-700">{help.description}</p>
          {help.video_url && (
            help.video_url.includes('youtube.com') || help.video_url.includes('youtu.be') ? (
              <iframe
                className="w-full aspect-video rounded"
                src={`https://www.youtube.com/embed/${getYouTubeId(help.video_url)}`}
                title={help.title}
                allowFullScreen
              />
            ) : (
              <video controls className="w-full rounded">
                <source src={help.video_url} />
                Your browser does not support the video tag.
              </video>
            )
          )}
        </div>
      ))}
    </div>
  );
}

function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
  return match ? match[1] : '';
} 