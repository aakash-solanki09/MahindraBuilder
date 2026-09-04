async function run() {
  const sfUrl = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00D4x000007sh6p';
  const params = new URLSearchParams();
  
  params.append('00N4x00000bbbE3', 'Surface Express');
  params.append('00N4x00000bbbEM', 'dont call its for testing');
  params.append('city', 'indore');
  params.append('company', 'testing');
  params.append('debug', '1');
  params.append('debugEmail', 'amin.noumita@mahindralogistics.com');
  params.append('email', 'dheeraj@gmail.com');
  params.append('encoding', 'UTF-8');
  params.append('first_name', 'dheeraj');
  params.append('last_name', 'singh');
  params.append('mobile', '6264037225');
  params.append('oid', '00D4x000007sh6p');
  params.append('phone', '6264037225');
  params.append('recordType', '012Vt0000023hFO');
  params.append('zip', '420011');

  console.log('Sending params:', params.toString());

  try {
    const res = await fetch(sfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: params.toString()
    });

    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response (first 2000 chars):');
    console.log(text.slice(0, 2000));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
