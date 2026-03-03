async function testLogin() {
  const response = await fetch('http://localhost:3000/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'azimut.it.02@mail.ru', type: 'login' })
  });
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Data:', data);
}
testLogin();
