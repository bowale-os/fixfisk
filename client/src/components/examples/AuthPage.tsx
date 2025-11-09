import { AuthPage } from '../AuthPage';

export default function AuthPageExample() {
  return (
    <AuthPage
      onSendMagicLink={(email) => console.log('Magic link sent to:', email)}
    />
  );
}
