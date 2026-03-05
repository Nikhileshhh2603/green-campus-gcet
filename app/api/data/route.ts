import { NextResponse } from 'next/server';
import campusData from './campusData.json';

export async function GET() {
  return NextResponse.json(campusData);
}