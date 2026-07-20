const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let users = [
  { id: 1, username: 'Wentik', password: 'admin123', role: 'admin' }
];

let posts = [
  { id: 1, author: 'Wentik', content: 'Bem-vindo ao app!', type: 'thread' }
];

let blogs = [
  { id: 1, title: 'Primeiro post', content: 'Olá mundo!', author: 'Wentik' }
];

let devLogs = [
  { id: 1, message: 'Sistema iniciado com sucesso.', author: 'Wentik' }
];

let notifications = [
  { id: 1, message: 'Nova atualização disponível.', read: false }
];

let announcements = [
  { id: 1, title: 'Bem-vindo', content: 'Este anúncio é administrado por Wentik.', author: 'Wentik' }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function isLocalhost(req) {
  const host = req.hostname || '';
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}

app.get('/admin-panel', (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).send('Acesso negado. O painel admin só está disponível em localhost.');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password && u.role === 'admin');
  if (!user) {
    return res.status(401).json({ success: false, error: 'Credenciais de admin inválidas' });
  }
  if (!isLocalhost(req)) {
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }
  res.json({ success: true, user });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const user = { id: Date.now(), username, password, role: 'user' };
  users.push(user);
  notifications.push({ id: Date.now(), message: `${username} criou uma conta.`, read: false });
  res.json({ success: true, user });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  notifications.push({ id: Date.now(), message: `${username} fez login.`, read: false });
  res.json({ success: true, user });
});

app.get('/admin', (req, res) => {
  if (isLocalhost(req)) {
    return res.redirect('/admin-panel');
  }
  res.json({ adminUser: 'Wentik', features: ['users','blogs','devlogs','notifications','threads'] });
});

app.get('/api/admin', (req, res) => {
  res.json({
    adminUser: 'Wentik',
    stats: {
      totalUsers: users.length,
      totalThreads: posts.length,
      totalBlogs: blogs.length,
      totalDevLogs: devLogs.length,
      unreadNotifications: notifications.filter(n => !n.read).length
    },
    features: ['users', 'blogs', 'devlogs', 'notifications', 'threads']
  });
});

app.get('/threads', (req, res) => {
  res.json(posts);
});

app.post('/threads', (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: 'Author and content required' });
  }
  const post = { id: Date.now(), author, content, type: 'thread' };
  posts.push(post);
  notifications.push({ id: Date.now(), message: `${author} criou um novo thread.`, read: false });
  res.json({ success: true, post });
});

app.get('/blogs', (req, res) => {
  res.json(blogs);
});

app.post('/blogs', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Title, content and author required' });
  }
  const blog = { id: Date.now(), title, content, author };
  blogs.push(blog);
  res.json({ success: true, blog });
});

app.get('/devlogs', (req, res) => {
  res.json(devLogs);
});

app.post('/devlogs', (req, res) => {
  const { message, author } = req.body;
  if (!message || !author) {
    return res.status(400).json({ error: 'Message and author required' });
  }
  const log = { id: Date.now(), message, author };
  devLogs.push(log);
  res.json({ success: true, log });
});

app.get('/notifications', (req, res) => {
  res.json(notifications);
});

app.get('/announcements', (req, res) => {
  res.json(announcements);
});

app.post('/announcements', (req, res) => {
  const { username, password, title, content } = req.body;
  if (!username || !password || !title || !content) {
    return res.status(400).json({ error: 'Username, password, title and content are required' });
  }
  if (username !== 'Wentik' || password !== 'admin123') {
    return res.status(403).json({ error: 'Only Wentik can manage announcements' });
  }
  const announcement = { id: Date.now(), title, content, author: 'Wentik' };
  announcements.unshift(announcement);
  notifications.push({ id: Date.now(), message: 'Novo anúncio publicado por Wentik.', read: false });
  res.json({ success: true, announcement });
});

app.put('/announcements/:id', (req, res) => {
  const { username, password, title, content } = req.body;
  if (!username || !password || !title || !content) {
    return res.status(400).json({ error: 'Username, password, title and content are required' });
  }
  if (username !== 'Wentik' || password !== 'admin123') {
    return res.status(403).json({ error: 'Only Wentik can manage announcements' });
  }
  const id = Number(req.params.id);
  const announcement = announcements.find(item => item.id === id);
  if (!announcement) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  announcement.title = title;
  announcement.content = content;
  res.json({ success: true, announcement });
});

app.delete('/announcements/:id', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (username !== 'Wentik' || password !== 'admin123') {
    return res.status(403).json({ error: 'Only Wentik can manage announcements' });
  }
  const id = Number(req.params.id);
  const index = announcements.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  announcements.splice(index, 1);
  notifications.push({ id: Date.now(), message: 'Um anúncio foi removido por Wentik.', read: false });
  res.json({ success: true });
});

app.post('/notifications/read', (req, res) => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  res.json({ success: true, notifications });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function startServer() {
  return app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
