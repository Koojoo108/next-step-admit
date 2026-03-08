import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Profile</h1>
      <div className="bg-card rounded-lg p-6 border border-border shadow-card space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Full Name</label>
          <p className="font-medium text-foreground">{user?.user_metadata?.full_name || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <p className="font-medium text-foreground">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Phone</label>
          <p className="font-medium text-foreground">{user?.user_metadata?.phone || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Account Created</label>
          <p className="font-medium text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
