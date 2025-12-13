import { supabase } from "@/app/utils/dbconnect";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
//GET: id->all data(modal),filter(home list)
//POST: alldata->upload(new user)

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const search = searchParams.get("search");

  if (id) {
    const { data, error } = await supabase
      .from("user")
      .select("id, name, email, phone, dob, anniversary, club, type,active,role, partner:partner_id (id, name, email, phone, dob, club, active,type,role)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: error?.message || "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  }

  if (search) {
    const terms = search.split(',').filter(term => term.trim() !== '');

    if (terms.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const conditions = terms.map(term =>
      `name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
    ).join(',');

    const { data, error } = await supabase
      .from("user")
      .select("id, name, email, phone, dob, anniversary, club, type")
      .or(conditions);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data || []), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
}
// Initialize R2 client
const r2Client = new S3Client({
  region: "auto", 
  endpoint: process.env.R2_ENDPOINT, 
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload image to R2
async function uploadImageToR2(id, imageFile) {
  if (!imageFile) return null;

  try {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const filename = `${id}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: "image/jpeg",
      ACL: "public-read", 
    });
    await r2Client.send(command);
    const publicUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${filename}`;
    return {
      success: true,
      message: "File uploaded successfully",
      file: { name: filename, url: publicUrl },
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    return null;
  }
}

// POST handler (same logic as before)
export async function POST(req) {
  const form = await req.formData();
  const anniversary = form.get("anniversary");

  const person1 = {
    name: form.get("name1"),
    role: form.get("role1"),
    email: form.get("email1"),
    phone: form.get("phone1"),
    dob: form.get("dob1"),
    userType: form.get("userType1"),
    club: form.get("club1"),
    image: form.get("image1"),
  };

  const person2 = {
    name: form.get("name2"),
    role: form.get("role2"),
    email: form.get("email2"),
    phone: form.get("phone2"),
    dob: form.get("dob2"),
    userType: form.get("userType2"),
    club: form.get("club2"),
    image: form.get("image2"),
  };

  try {
    // Insert users into Supabase
    const { data: person1Data, error: person1Error } = await supabase
      .from("user")
      .insert({
        name: person1.name,
        role: person1.role,
        email: person1.email || null,
        phone: person1.phone || null,
        dob: person1.dob || null,
        type: person1.userType,
        club: person1.club || null,
        anniversary: anniversary || null,
        profile: false,
        active: true,
      })
      .select()
      .single();
    if (person1Error) throw person1Error;
    const person1Id = person1Data.id;

    const { data: person2Data, error: person2Error } = await supabase
      .from("user")
      .insert({
        name: person2.name,
        role: person2.role,
        email: person2.email || null,
        phone: person2.phone || null,
        dob: person2.dob || null,
        type: person2.userType,
        club: person2.club || null,
        anniversary: anniversary || null,
        profile: false,
        active: true,
      })
      .select()
      .single();
    if (person2Error) throw person2Error;
    const person2Id = person2Data.id;

    // Link partners
    await supabase.from("user").update({ partner_id: person2Id }).eq("id", person1Id);
    await supabase.from("user").update({ partner_id: person1Id }).eq("id", person2Id);

    // Upload images
    let person1ProfileUpdate = false;
    let person2ProfileUpdate = false;

    if (person1.image?.size > 0) {
      const uploadResult = await uploadImageToR2(person1Id, person1.image);
      if (uploadResult?.success) {
        await supabase.from("user").update({ profile: true }).eq("id", person1Id);
        person1ProfileUpdate = true;
      }
    }

    if (person2.image?.size > 0) {
      const uploadResult = await uploadImageToR2(person2Id, person2.image);
      if (uploadResult?.success) {
        await supabase.from("user").update({ profile: true }).eq("id", person2Id);
        person2ProfileUpdate = true;
      }
    }

    // Log creation
    const logUser = async (userId, data) => {
      await supabase.from("change_log").insert({
        user_id: userId,
        action: "create",
        changes: {
          name: data.name,
          role: data.role,
          email: data.email,
          phone: data.phone,
          dob: data.dob,
          type: data.type,
          club: data.club,
          anniversary: anniversary || null,
          active: true,
        },
      });
    };

    await Promise.all([logUser(person1Data.id, person1Data), logUser(person2Data.id, person2Data)]);

    return new Response(
      JSON.stringify({
        message: "Data submitted successfully",
        person1: { id: person1Id, partner_id: person2Id, profile_updated: person1ProfileUpdate },
        person2: { id: person2Id, partner_id: person1Id, profile_updated: person2ProfileUpdate },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit data", details: error.message }),
      { status: 500 }
    );
  }
}