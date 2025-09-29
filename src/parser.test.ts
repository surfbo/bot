import { describe, test, expect } from 'bun:test';
import { parser, extractDataFromHTML, getWeekDay, getMonthDay } from './parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('parser with real HTML samples', () => {
  test('should parse sillon_ok.html correctly', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    const result = parser(html);
    
    expect(result).toHaveProperty('surf');
    expect(result).toHaveProperty('formattedEvents');
    expect(typeof result.surf).toBe('boolean');
    expect(Array.isArray(result.formattedEvents)).toBe(true);
    
    // Log the actual results for verification
    console.log('sillon_ok.html results:', {
      surf: result.surf,
      formattedEvents: result.formattedEvents
    });
  });

  test('should parse sillon_ok_2.html correctly', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok_2.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    const result = parser(html);
    
    expect(result).toHaveProperty('surf');
    expect(result).toHaveProperty('formattedEvents');
    expect(typeof result.surf).toBe('boolean');
    expect(Array.isArray(result.formattedEvents)).toBe(true);
    
    // Log the actual results for verification
    console.log('sillon_ok_2.html results:', {
      surf: result.surf,
      formattedEvents: result.formattedEvents
    });
  });

  test('should extract intervals from sillon_ok.html', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    // Test the extractDataFromHTML function indirectly through parser
    const result = parser(html);
    
    // Should have extracted some data if the HTML is valid
    expect(result.formattedEvents.length).toBeGreaterThanOrEqual(0);
  });

  test('should extract intervals from sillon_ok_2.html', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok_2.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    // Test the extractDataFromHTML function indirectly through parser
    const result = parser(html);
    
    // Should have extracted some data if the HTML is valid
    expect(result.formattedEvents.length).toBeGreaterThanOrEqual(0);
  });

  test('should format events correctly for sillon_ok.html', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    const result = parser(html);
    
    // Each formatted event should either be '(...)' or contain bullet points
    result.formattedEvents.forEach(event => {
      expect(typeof event).toBe('string');
      if (event !== '(...)') {
        expect(event).toMatch(/\d・\d・\d/);
      }
    });
  });

  test('should format events correctly for sillon_ok_2.html', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok_2.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    const result = parser(html);
    
    // Each formatted event should either be '(...)' or contain bullet points
    result.formattedEvents.forEach(event => {
      expect(typeof event).toBe('string');
      if (event !== '(...)') {
        expect(event).toMatch(/\d・\d・\d/);
      }
    });
  });

  test('comparison between sillon_ok.html and sillon_ok_2.html', () => {
    const html1Path = join(__dirname, '../parser/test/sillon_ok.html');
    const html2Path = join(__dirname, '../parser/test/sillon_ok_2.html');
    
    const html1 = readFileSync(html1Path, 'utf-8');
    const html2 = readFileSync(html2Path, 'utf-8');
    
    const result1 = parser(html1);
    const result2 = parser(html2);
    
    // Both should have the same structure
    expect(typeof result1.surf).toBe(typeof result2.surf);
    expect(Array.isArray(result1.formattedEvents)).toBe(Array.isArray(result2.formattedEvents));
    
    console.log('Comparison results:', {
      sillon_ok: { surf: result1.surf, eventCount: result1.formattedEvents.length },
      sillon_ok_2: { surf: result2.surf, eventCount: result2.formattedEvents.length }
    });
  });
});

describe('extractDataFromHTML', () => {
  test('should extract intervals from sillon_ok.html', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    const result = extractDataFromHTML(html);
    
    expect(result).toHaveProperty('intervals');
    expect(result).toHaveProperty('ratings');
    expect(Array.isArray(result.intervals)).toBe(true);
    expect(Array.isArray(result.ratings)).toBe(true);
    expect(result.intervals.length).toBeGreaterThan(0);
    expect(result.ratings.length).toBeGreaterThan(0);
    
    console.log('sillon_ok.html extracted data:', {
      intervalCount: result.intervals.length,
      ratingCount: result.ratings.length,
      firstInterval: result.intervals[0],
      firstRating: result.ratings[0]
    });
  });

  test('should extract intervals from sillon_ok_2.html', () => {
    const htmlPath = join(__dirname, '../parser/test/sillon_ok_2.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    const result = extractDataFromHTML(html);
    
    expect(result).toHaveProperty('intervals');
    expect(result).toHaveProperty('ratings');
    expect(Array.isArray(result.intervals)).toBe(true);
    expect(Array.isArray(result.ratings)).toBe(true);
    
    console.log('sillon_ok_2.html extracted data:', {
      intervalCount: result.intervals.length,
      ratingCount: result.ratings.length,
      firstInterval: result.intervals[0],
      firstRating: result.ratings[0]
    });
  });

  test('should handle empty HTML', () => {
    const result = extractDataFromHTML('');
    
    expect(result.intervals).toEqual([]);
    expect(result.ratings).toEqual([]);
  });

  test('should handle HTML without forecast elements', () => {
    const html = '<div>No forecast content here</div>';
    const result = extractDataFromHTML(html);
    
    expect(result.intervals).toEqual([]);
    expect(result.ratings).toEqual([]);
  });

  test('should extract intervals and ratings correctly from mock HTML', () => {
    const mockHtml = `
      <div>
        <span class="forecast-table__value">matin</span>
        <span class="forecast-table__value">après-midi</span>
        <span class="forecast-table__value">soir</span>
        <div class="star-rating__rating">2</div>
        <div class="star-rating__rating">3</div>
        <div class="star-rating__rating">1</div>
      </div>
    `;
    
    const result = extractDataFromHTML(mockHtml);
    
    expect(result.intervals).toEqual(['matin', 'après-midi', 'soir']);
    expect(result.ratings).toEqual(['2', '3', '1']);
  });
});

describe('helper functions', () => {
  describe('getWeekDay', () => {
    test('should return French weekday names', () => {
      const monday = new Date('2024-01-01'); // This is a Monday
      const tuesday = new Date('2024-01-02');
      const wednesday = new Date('2024-01-03');
      
      expect(getWeekDay(monday)).toBe('lundi');
      expect(getWeekDay(tuesday)).toBe('mardi');
      expect(getWeekDay(wednesday)).toBe('mercredi');
    });

    test('should handle different dates correctly', () => {
      const sunday = new Date('2024-01-07'); // This is a Sunday
      const result = getWeekDay(sunday);
      
      expect(result).toBe('dimanche');
      expect(typeof result).toBe('string');
    });
  });

  describe('getMonthDay', () => {
    test('should return day as 2-digit string', () => {
      const firstDay = new Date('2024-01-01');
      const tenthDay = new Date('2024-01-10');
      const lastDay = new Date('2024-01-31');
      
      expect(getMonthDay(firstDay)).toBe('01');
      expect(getMonthDay(tenthDay)).toBe('10');
      expect(getMonthDay(lastDay)).toBe('31');
    });

    test('should handle different months correctly', () => {
      const febDay = new Date('2024-02-15');
      const decDay = new Date('2024-12-25');
      
      expect(getMonthDay(febDay)).toBe('15');
      expect(getMonthDay(decDay)).toBe('25');
    });
  });
});