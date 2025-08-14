const SANDBOX_API_KEY='key_live_4e188ef5754649e5aceaff5733a62c30'
const SANDBOX_API_SECRET='secret_live_0afc41875f284de5a2e563b5d6d3f3e9'
export async function POST(req) {
  try {
    // Changed here to match frontend: destructure pan, dob, name_as_per_pan, reason
    const { pan, dob, name_as_per_pan, reason } = await req.json();
    if (!pan || !dob || !name_as_per_pan || !reason) {
      return new Response(
        JSON.stringify({ error: "PAN, DOB, Name and Reason are required" }),
        { status: 400 }
      );
    }

    // 1️⃣ Authenticate
    const authRes = await fetch("https://api.sandbox.co.in/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SANDBOX_API_KEY,
        "x-api-secret": SANDBOX_API_SECRET,
      },
    });

    function formatDateToDDMMYYYY(dateStr) {
    // dateStr expected in "yyyy-mm-dd"
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    }

    const authData = await authRes.json();

    // Log the full auth response to confirm API call
    console.log("AUTH RESPONSE:", authData);
    if (!authRes.ok) {
      console.error("AUTH RESPONSE:", authData);
      return new Response(JSON.stringify(authData), { status: authRes.status });
    }

    const accessToken = authData.access_token || authData.data?.access_token;

    // Print the access token value
    console.log("Access Token:", accessToken);
    const formattedDob = formatDateToDDMMYYYY(dob);
    console.log("Formatted DOB:", formattedDob);
    // 2️⃣ Verify PAN using access_token
    const verifyRes = await fetch("https://api.sandbox.co.in/kyc/pan/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": accessToken,
        "x-api-key": SANDBOX_API_KEY,
        "x-accept-cache": "true",
        // Add x-api-version header here if your doc specifies a version
        // "x-api-version": "1.0",
      },
      body: JSON.stringify({
        "@entity": "in.co.sandbox.kyc.pan_verification.request",
        pan,
        name_as_per_pan,
        date_of_birth: formattedDob,
        consent: "Y",
        reason,
      }),
    });

    const verifyData = await verifyRes.json();
    console.log("VERIFY RESPONSE:", verifyData);

    return new Response(JSON.stringify(verifyData), { status: verifyRes.status });
  } catch (error) {
    console.error("Error in verify-pan:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
