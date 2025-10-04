import sql from '@/app/api/utils/sql';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, libraryId, name, phone, seatNumber, startDate, endDate, photoUrl } = body;

    // Validation
    if (!id || !libraryId) {
      return Response.json(
        { error: 'Student ID and Library ID are required' },
        { status: 400 }
      );
    }

    // Check if student exists and belongs to the library
    const existingStudent = await sql`
      SELECT id, seat_number FROM students 
      WHERE id = ${id} AND library_id = ${libraryId} AND is_active = true
    `;

    if (existingStudent.length === 0) {
      return Response.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // If seat number is being changed, check if new seat is available
    if (seatNumber && seatNumber !== existingStudent[0].seat_number) {
      const seatTaken = await sql`
        SELECT id FROM students 
        WHERE library_id = ${libraryId} AND seat_number = ${seatNumber} AND is_active = true AND id != ${id}
      `;

      if (seatTaken.length > 0) {
        return Response.json(
          { error: 'Seat is already occupied by another student' },
          { status: 409 }
        );
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (seatNumber !== undefined) {
      updates.push(`seat_number = $${paramIndex++}`);
      values.push(seatNumber);
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(endDate);
    }
    if (photoUrl !== undefined) {
      updates.push(`photo_url = $${paramIndex++}`);
      values.push(photoUrl);
    }

    if (updates.length === 0) {
      return Response.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add WHERE clause parameters
    values.push(id);
    values.push(libraryId);

    const updateQuery = `
      UPDATE students 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND library_id = $${paramIndex++}
      RETURNING id, library_id, name, phone, seat_number, start_date, end_date, photo_url, is_active, created_at
    `;

    const result = await sql(updateQuery, values);

    if (result.length === 0) {
      return Response.json(
        { error: 'Failed to update student' },
        { status: 500 }
      );
    }

    const student = result[0];

    return Response.json({
      success: true,
      student: {
        id: student.id,
        libraryId: student.library_id,
        name: student.name,
        phone: student.phone,
        seatNumber: student.seat_number,
        startDate: student.start_date,
        endDate: student.end_date,
        photoUrl: student.photo_url,
        isActive: student.is_active,
        createdAt: student.created_at
      }
    });

  } catch (error) {
    console.error('Student update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}