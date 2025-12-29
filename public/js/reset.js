function sendReset(e) {
  e.preventDefault();

  fetch("/api/sessions/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.value })
  })
    .then(() => alert("Correo de recuperación enviado"));
}
