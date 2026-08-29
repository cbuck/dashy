import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import request from '@/utils/request';
import GluetunStatus from '@/components/Widgets/GluetunStatus.vue';

vi.mock('@/utils/request', () => ({ default: vi.fn() }));
vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));

async function mount(options = {}) {
  const wrapper = shallowMount(GluetunStatus, {
    props: {
      options: {
        hostname: 'http://gluetun:8000',
        ...options,
      },
    },
  });
  await flushPromises();
  return wrapper;
}

describe('GluetunStatus widget authentication', () => {
  beforeEach(() => {
    request.mockReset();
    request.mockResolvedValue({ data: {} });
  });

  it('sends an API key to both Gluetun endpoints', async () => {
    await mount({ apiKey: 'gluetun-key' });

    expect(request).toHaveBeenCalledTimes(2);
    request.mock.calls.forEach(([config]) => {
      expect(config.headers).toEqual({ 'X-API-Key': 'gluetun-key' });
    });
  });

  it('supports HTTP basic authentication', async () => {
    await mount({ username: 'dashy', password: 'secret' });

    request.mock.calls.forEach(([config]) => {
      expect(config.headers).toEqual({ Authorization: 'Basic ZGFzaHk6c2VjcmV0' });
    });
  });

  it('prefers an API key when both authentication methods are configured', async () => {
    await mount({ apiKey: 'gluetun-key', username: 'dashy', password: 'secret' });

    request.mock.calls.forEach(([config]) => {
      expect(config.headers).toEqual({ 'X-API-Key': 'gluetun-key' });
    });
  });

  it('keeps explicitly unprotected Gluetun routes working', async () => {
    await mount();

    request.mock.calls.forEach(([config]) => {
      expect(config.headers).toEqual({});
    });
  });
});
