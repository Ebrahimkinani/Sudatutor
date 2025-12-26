import { NextResponse } from 'next/server'
import { subjectRepo } from './subject.repo'

export async function GET() {
    try {
        const subjects = await subjectRepo.findAllActive()
        return NextResponse.json({ subjects })
    } catch (error) {
        console.error('Error fetching subjects:', error)
        return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
    }
}
