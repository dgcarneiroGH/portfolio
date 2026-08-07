import { LangTagPipe } from './lang-tag.pipe';

describe('LangTagPipe', () => {
  const pipe = new LangTagPipe();

  it('should wrap a single jargon term', () => {
    expect(pipe.transform('Angular')).toBe('<span lang="en">Angular</span>');
  });

  it('should wrap jargon inside a sentence', () => {
    expect(pipe.transform('Uso Angular y Django'))
      .toBe('Uso <span lang="en">Angular</span> y <span lang="en">Django</span>');
  });

  it('should not wrap jargon inside <code> blocks', () => {
    expect(pipe.transform('Install <code>npm i angular</code> now'))
      .toBe('Install <code>npm i angular</code> now');
  });

  it('should not wrap jargon inside <pre> blocks', () => {
    expect(pipe.transform('<pre>Angular setup</pre>'))
      .toBe('<pre>Angular setup</pre>');
  });

  it('should be idempotent (does not double-wrap existing spans)', () => {
    const input = '<span lang="en">Angular</span>';
    expect(pipe.transform(input)).toBe('<span lang="en">Angular</span>');
  });

  it('should handle null and undefined inputs gracefully', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should wrap jargon only outside HTML attributes (skips <a> content)', () => {
    expect(pipe.transform('Click <a href="https://angular.io">Angular</a> site'))
      .toBe('Click <a href="https://angular.io">Angular</a> site');
  });
});
