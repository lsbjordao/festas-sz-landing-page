// ./package/src/app/api/eventos/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL;

// Dados mockados temporários
const eventosMock = [
  {
    _id: "1",
    title: "Festa VIP - Opening Season",
    data: "2024-12-15",
    descp: "A maior festa VIP da cidade com DJs internacionais",
    image: "/images/festa1.jpg",
    icon: "🎉",
    localizacao: "Night Club Premium - Centro",
    estiloMusical: "Eletrônica",
    destaque: true,
    horario: "23:00",
    slug: "festa-vip-opening",
    whatsappLink: "https://wa.me/5511999999999"
  }
];

export async function GET() {
  if (!uri) {
    console.log('📝 Usando dados mockados (URI não configurada)');
    return NextResponse.json(eventosMock);
  }
  
  let client;
  
  try {
    console.log('🔌 Tentando conexão MongoDB Atlas...');
    
    // CONFIGURAÇÃO SUPER SIMPLIFICADA - sem opções TLS
    client = new MongoClient(uri);
    
    // Timeout manual para não travar
    const connectionPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Conectado ao MongoDB Atlas!');

    const db = client.db();
    const eventos = await db.collection('eventos').find({}).limit(10).toArray();
    console.log(`📊 ${eventos.length} eventos carregados`);

    const eventosSerializados = eventos.map(evento => ({
      _id: evento._id.toString(),
      data: evento.data,
      title: evento.title,
      descp: evento.descp,
      image: evento.image,
      icon: evento.icon,
      localizacao: evento.localizacao,
      estiloMusical: evento.estiloMusical,
      destaque: evento.destaque,
      horario: evento.horario,
      slug: evento.slug,
      whatsappLink: evento.whatsappLink
    }));

    return NextResponse.json(eventosSerializados);

  } catch (error: any) {
    console.log('🔁 MongoDB falhou, usando dados mockados:', error.message);
    
    // Retorna dados mockados para desenvolvimento continuar
    return NextResponse.json(eventosMock);
  } finally {
    if (client) {
      await client.close().catch(() => {});
    }
  }
}