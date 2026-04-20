import { useNavigate } from "react-router-dom";

export default function EmploiTempsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)}>← Retour</button>
      <h2>Emploi du temps</h2>
      <p>Page en construction...</p>
    </div>
  );
}