import dbConnect from "@/lib/mongodb";
import User from '@/models/Users'
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

export async function POST(req) {
    await dbConnect();

    try{
        const {name,email,password} = await req.json();

        const existingUser = await User.findOne({email});

        if(existingUser) return NextResponse.json({message: "User alredy exists"}, {status: 400});

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({email,password:hashedPassword,name});

        return NextResponse.json({message: "Registration complete ..!"},{status:201});
    }catch(error){
        return NextResponse.json({error: error.message},{status:500});
    }
}