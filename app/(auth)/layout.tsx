const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="from-primary/5 via-background to-background relative min-h-screen bg-gradient-to-br">
      {children}
    </div>
  );
};

export default AuthLayout;
