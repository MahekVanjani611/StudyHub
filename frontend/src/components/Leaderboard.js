import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/users';
import './Leaderboard.css';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const Avatar = ({ name, src }) => (
  <div className="lb-avatar">
    <span className="lb-avatar-initials">{getInitials(name)}</span>
    {src && (
      <img
        src={src}
        alt={name}
        className="lb-avatar-img"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    )}
  </div>
);

const LeaderboardSkeleton = () => (
  <ul className="list-group list-group-flush">
    {Array.from({ length: 6 }).map((_, i) => (
      <li key={i} className="lb-row lb-row-skeleton">
        <span className="lb-rank lb-skeleton-block" />
        <span className="lb-avatar lb-skeleton-block" />
        <div className="flex-grow-1">
          <div className="lb-skeleton-line" style={{ width: '40%' }} />
          <div className="lb-skeleton-line" style={{ width: '25%' }} />
        </div>
        <div className="lb-skeleton-line" style={{ width: '60px' }} />
      </li>
    ))}
  </ul>
);

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getLeaderboard()
      .then((res) => {
        setUsers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching leaderboard', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5 mb-5 leaderboard-container">
      <div className="text-center mb-4">
        <h2 className="mb-1">🏆 Global Leaderboard</h2>
        <p className="text-muted mb-0">See how you stack up against the community</p>
      </div>

      <div className="card lb-card">
        <div className="card-body p-0">
          {loading && <LeaderboardSkeleton />}

          {!loading && error && (
            <div className="lb-empty">
              <span className="lb-empty-icon">⚠️</span>
              <p className="mb-0">Couldn't load the leaderboard. Please try again later.</p>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="lb-empty">
              <span className="lb-empty-icon">🌱</span>
              <p className="mb-0">No rankings yet — be the first to earn XP!</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <ul className="list-group list-group-flush">
              {users.map((u, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                return (
                  <li
                    key={u._id}
                    className={`lb-row${isTopThree ? ` lb-row-top lb-rank-${rank}` : ''}`}
                  >
                    <span className={`lb-rank${isTopThree ? ' lb-rank-medal' : ''}`}>
                      {isTopThree ? RANK_MEDALS[rank - 1] : `#${rank}`}
                    </span>

                    <Avatar name={u.name} src={u.avatar} />

                    <div className="flex-grow-1 min-w-0">
                      <h5 className="lb-name mb-0">{u.name}</h5>
                      <small className="lb-streak">
                        🔥 {u.streak?.current || 0} day streak
                      </small>
                    </div>

                    <div className="text-end">
                      <div className="lb-xp">{u.xp || 0} XP</div>
                      {u.badges && u.badges.length > 0 && (
                        <small className="lb-badges">{u.badges.length} badges</small>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
