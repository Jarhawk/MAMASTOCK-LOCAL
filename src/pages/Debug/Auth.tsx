import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/runtime/isTauri";

export default function AuthDebug() {
  const { id, email, mama_id, signOut } = useAuth();

  return (
    <div>
      <h1>Debug Auth</h1>
      <p>ID: {id}</p>
      <p>Email: {email}</p>
      <p>Mama ID: {mama_id}</p>
      <button onClick={signOut}>Se déconnecter</button>
    </div>);

}