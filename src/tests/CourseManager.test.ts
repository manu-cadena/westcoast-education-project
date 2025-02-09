import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { CourseManager } from '../services/CourseManager';

global.fetch = vi.fn(); // Mock fetch globally

describe('CourseManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
  });

  // ✅ Test fetching courses
  it('should fetch courses', async () => {
    const mockCourses = [
      {
        id: '1',
        title: 'JavaScript Basics',
        courseNumber: 'JS101',
        duration: '2 weeks',
        cost: '500 kr',
        availability: 'Online',
        image: '',
        dates: '2025-03-01',
        popular: false,
        description: 'Intro to JS',
      },
    ];

    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockCourses),
    });

    const courses = await CourseManager.getCourses();
    expect(courses).toEqual(mockCourses);
  });

  // ✅ Test adding a course
  it('should add a course', async () => {
    const newCourse = {
      id: '2',
      title: 'Advanced TypeScript',
      courseNumber: 'TS201',
      duration: '3 weeks',
      cost: '700 kr',
      availability: 'Online',
      image: '',
      dates: '2025-04-01',
      popular: false,
      description: 'Deep dive into TS',
    };

    (fetch as Mock).mockResolvedValue({ ok: true });

    await CourseManager.addCourse(newCourse);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/courses',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      })
    );
  });

  // ✅ Test API failure scenario
  it('should throw an error if fetching courses fails', async () => {
    (fetch as Mock).mockRejectedValue(new Error('Network error'));

    await expect(CourseManager.getCourses()).rejects.toThrow('Network error');
  });
});
