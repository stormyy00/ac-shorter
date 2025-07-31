import URLShortener from "@/components/home";
import { getToken } from "@/utils/auth";

const page = async () => {
  const { token } = await getToken();

  const data = await fetch("http://localhost:8080/auth/verify", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
  console.log("Home data", data);
  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-200 p-10">
      <URLShortener data={data} />
    </div>
  );
};

export default page;
