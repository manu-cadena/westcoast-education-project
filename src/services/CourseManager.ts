export class CourseManager {
  private static API_URL = 'http://localhost:3000/courses';

  static async getCourses(): Promise<any[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    } catch (error) {
      throw new Error((error as Error).message || 'Unknown error occurred');
    }
  }

  static async addCourse(course: any): Promise<void> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      throw new Error('Failed to add course');
    }
  }
}
