import { Suspense } from 'react';
import SigninForm from './SigninForm';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninForm />
    </Suspense>
  );
}
 
