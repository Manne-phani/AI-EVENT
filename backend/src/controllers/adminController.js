const { dbAll, dbGet } = require('../config/db');

const getAnalytics = async (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';

  if (!req.user || req.user.gmail !== adminEmail) {
    return res.status(403).json({ error: 'Access denied. Only the authorized administrator can access this page.' });
  }

  try {
    // 1. Total Generations
    const totalGenerations = await dbGet('SELECT COUNT(*) as count FROM generations');

    // 2. Average Rating
    const avgRating = await dbGet('SELECT AVG(rating) as avg FROM feedbacks');

    // 3. Like/Dislike Ratio (AI quality trends)
    const feedbackCounts = await dbAll('SELECT sentiment, COUNT(*) as count FROM feedbacks GROUP BY sentiment');
    const likes = (feedbackCounts.find(f => f.sentiment === 'like')?.count) || 0;
    const dislikes = (feedbackCounts.find(f => f.sentiment === 'dislike')?.count) || 0;

    // 4. Top Event Types
    const topEvents = await dbAll('SELECT event_type, COUNT(*) as count FROM generations GROUP BY event_type ORDER BY count DESC LIMIT 5');

    // 5. Popular Cake Types
    const topCakes = await dbAll('SELECT main_cake_type, COUNT(*) as count FROM generations GROUP BY main_cake_type ORDER BY count DESC LIMIT 5');

    // 6. User activity
    const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users');
    const activeUsers = await dbGet('SELECT COUNT(DISTINCT user_id) as count FROM generations');

    // 7. Daily generation data (for the chart) - past 7 days (or just group by date)
    const dailyChart = await dbAll(`
      SELECT DATE(timestamp) as date, COUNT(*) as count 
      FROM generations 
      GROUP BY DATE(timestamp) 
      ORDER BY date ASC 
      LIMIT 15
    `);

    // 8. Recent feedback logs
    const recentFeedbacks = await dbAll(`
      SELECT f.rating, f.sentiment, f.comment, f.timestamp, g.event_type, g.main_cake_type
      FROM feedbacks f
      JOIN generations g ON f.generation_id = g.id
      ORDER BY f.timestamp DESC
      LIMIT 5
    `);

    return res.status(200).json({
      totalGenerations: totalGenerations.count,
      averageRating: avgRating.avg ? parseFloat(avgRating.avg.toFixed(1)) : 0,
      likes,
      dislikes,
      topEvents,
      topCakes,
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      dailyChart,
      recentFeedbacks
    });

  } catch (error) {
    console.error('Error fetching admin analytics:', error.message);
    return res.status(500).json({ error: 'Server error retrieving analytics.' });
  }
};

module.exports = {
  getAnalytics
};
