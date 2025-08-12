// "use client";

// import { useState } from "react";

// export default function Page() {
//   const [pan, setPan] = useState("");
//   const [dob, setDob] = useState("");
//   const [name, setName] = useState("");         // New state
//   const [reason, setReason] = useState("");     // New state
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setResult(null);

//     try {
//       const res = await fetch("/api/verify-pan", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           pan: pan.trim().toUpperCase(),
//           dob,
//           name_as_per_pan: name.trim(),
//           reason: reason.trim(),
//         }),
//       });
//       const data = await res.json();
//       setResult(data);
//     } catch (err) {
//       setResult({ error: "Failed to call server" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-slate-50 flex items-start justify-center p-6">
//       <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-semibold mb-4">PAN Verification</h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700">PAN</label>
//             <input
//               value={pan}
//               onChange={(e) => setPan(e.target.value)}
//               placeholder="ABCDE1234F"
//               required
//               className="mt-1 block w-full border rounded-md px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700">Name as per PAN</label>   {/* New input */}
//             <input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="John Ronald Doe"
//               required
//               className="mt-1 block w-full border rounded-md px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
//             <input
//               type="date"
//               value={dob}
//               onChange={(e) => setDob(e.target.value)}
//               required
//               className="mt-1 block w-full border rounded-md px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700">Reason for verification</label>   {/* New input */}
//             <input
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="For onboarding customers"
//               required
//               className="mt-1 block w-full border rounded-md px-3 py-2"
//             />
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="inline-flex items-center justify-center rounded bg-sky-600 text-white px-4 py-2"
//             >
//               {loading ? "Verifying..." : "Verify PAN"}
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 setPan("");
//                 setDob("");
//                 setName("");        // reset new fields
//                 setReason("");
//                 setResult(null);
//               }}
//               className="inline-flex items-center justify-center rounded border px-3 py-2"
//             >
//               Reset
//             </button>
//           </div>
//         </form>

//         {result && (
//           <section className="mt-6">
//             <h2 className="text-lg font-medium mb-2">Result</h2>
//             <pre className="whitespace-pre-wrap bg-slate-100 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
//           </section>
//         )}
//       </div>
//     </main>
//   );
// }


import { useState } from "react";

export default function PanForm() {
  const [pan, setPan] = useState("");
  const [dob, setDob] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/verify-pan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan, dob, name_as_per_pan: name, reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="bg-white shadow-lg rounded-lg max-w-md w-full p-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">PAN Verification</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="pan">PAN Number</label>
            <input
              id="pan"
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="name">Name as per PAN</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Ronald Doe"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="reason">Reason for Verification</label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For onboarding customers"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify PAN"}
          </button>
        </form>

        {error && <p className="mt-5 text-red-600 font-medium">{error}</p>}

        {result && (
          <section className="mt-6 bg-gray-100 p-4 rounded-md overflow-auto max-h-64">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Verification Result</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </section>
        )}
      </section>
    </main>
  );
}
