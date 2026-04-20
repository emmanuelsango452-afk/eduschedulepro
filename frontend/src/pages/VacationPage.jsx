import { useNavigate } from "react-router-dom";

export default function VacationPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)}>← Retour</button>
      <h2>Fiches de vacation</h2>
      <p>Page en construction...</p>
    </div>
  );
}