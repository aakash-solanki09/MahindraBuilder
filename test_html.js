async function run() {
  const sfUrl = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00D4x000007sh6p';
  const params = new URLSearchParams();
  
  params.append('oid', '00D4x000007sh6p');
  params.append('retURL', 'http://google.com');
  params.append('recordType', '012Vt0000023hFO');
  params.append('Vertical_DH__c', 'Not specified');
  params.append('lead_source', 'Campaign');
  params.append('Entity__c', 'MESPL');
  params.append('debug', '1');
  params.append('debugEmail', 'amin.noumita@mahindralogistics.com');
  
  params.append('first_name', 'HTMLTest');
  params.append('last_name', 'User');
  params.append('email', 'htmltest@example.com');
  params.append('company', 'HTML Company');
  params.append('city', 'Mumbai');
  params.append('zip', '400001');
  params.append('mobile', '9999999999');
  
  params.append('00N4x00000bbbE3', 'Surface Express');
  params.append('00N4x00000bbbEM', 'testing from exact html payload');
  params.append('submit', 'Submit');

  console.log('Sending exact HTML params:', params.toString());

  try {
    const res = await fetch(sfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.slice(0, 500));
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
