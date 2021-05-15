const baseUrl = 'http://127.0.0.1:3000';
class Http {
  // BaseUrl = baseUrl;
  toUrlQuery(obj) {
    return Object.keys(obj || {})
      .map((key) => `${key}=${obj[key]}`)
      .join('&');
  }

  parseUrlParams(url) {
    const [a, b] = (url || window.location.href).split('?');
    if (!b) {
      return {};
    }
    const obj = {};
    b.split('&').forEach((kv) => {
      const [key, value] = kv.split('=');
      obj[key] = decodeURIComponent(value);
    });
    return obj;
  }

  async ajax({ url, method = 'get', headers = { 'content-type': 'application/json' }, params, data } = {}) {
    const query = this.toUrlQuery(params || {});
    const _url = baseUrl + url + (query ? '?' + query : '');
    console.log(_url);
    const result = await fetch(_url, { withCredentials: true, credentials: 'include', method, headers, body: data });
    const { status } = result;
    // debugger;
    if (status < 300) {
      const body = await result.json();
      console.log(body);
      return body;
    }
    return Promise.reject('error');
  }

  async getApi(url, params) {
    console.log(url, params);
    return this.ajax({ url, method: 'get', params });
  }
  async postApi(url, data) {
    return this.ajax({ url, method: 'post', data: JSON.stringify(data || {}) });
  }

  async delay(time = 1500) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time || 1500);
    });
  }

  getValue(key) {
    if (!key) {
      return null;
    }
    const val = window.sessionStorage.getItem(key);
    if (!val) {
      return null;
    }
    return JSON.parse(val);
  }
  setValue(key, value) {
    if (value) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      window.sessionStorage.removeItem(key);
    }
  }

  getCookie() {
    const val = document.cookie;
    const tmp = {};
    val.split(';').forEach((kv) => {
      const [key, value] = kv.trim().split('=');
      tmp[key] = value;
    });
    console.log(tmp);
    return tmp;
  }
}

export default new Http();
