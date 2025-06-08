import { Suspense } from 'react';
import SigninForm from './SigninForm';

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninForm />
    </Suspense>
  );
}
