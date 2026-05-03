const jwt = require('jsonwebtoken');
const fs = require('fs');

async function test() {
  try {
    const token = jwt.sign(
      { sellerId: '65f1a2b3c4d5e6f7a8b9c0d1', shopId: '65f1a2b3c4d5e6f7a8b9c0d2' },
      'super_secret_world_class_jwt_key',
      { expiresIn: '1h' }
    );

    // Create a dummy image
    const formData = new FormData();
    const blob = new Blob(["dummy content"], { type: "image/png" });
    formData.append("menuImage", blob, "menu.png");

    const response = await fetch('http://localhost:5000/api/seller/ai-menu-image-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    console.log("STATUS:", response.status);
    console.log("RESPONSE:", data);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

test();
