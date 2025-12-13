// Simple session storage
const sessions = new Map();

export function createSession(user) {
  const sessionId = Math.random().toString(36).substring(2);
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  sessions.set(sessionId, { 
    user, 
    expiresAt 
  });
  
  // Clean up expired sessions
  cleanupSessions();
  
  return { sessionId, expiresAt };
}

export function getSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

function cleanupSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}

export async function verifyCredentials(username, password) {
  const envUsername = process.env.AUTH_USERNAME;
  const envPassword = process.env.AUTH_PASSWORD;
  
  return username === envUsername && password === envPassword;
}

export async function verifyAuth(request) {
  const authSession = request.cookies.get('authSession')?.value;
  return authSession === 'true';
}