import * as Recharts from 'recharts';

export default function RechartsWrapper({ children }) {
  if (typeof children === 'function') {
    return children(Recharts);
  }
  return null;
}
