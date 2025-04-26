/**
 * Letterflow Form Embed SDK v1.1.0
 * This script allows embedding Letterflow subscription forms on any website.
 */
(function () {
  // Configuration and state
  let formKey = null;
  let formContainer = null;
  let formConfig = null;
  let loadingTimeout = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const LOADING_TIMEOUT = 10000; // 10 seconds

  // Get the actual domain from the current script tag or fallback
  const scriptTag = getCurrentScript();
  const baseUrl = getBaseUrl(scriptTag);

  /**
   * Get the current script element
   */
  function getCurrentScript() {
    if (document.currentScript) {
      return document.currentScript;
    }

    // Fallback for browsers that don't support currentScript
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const script = scripts[i];
      if (script.src && script.src.includes('embed.js')) {
        return script;
      }
    }

    return null;
  }

  /**
   * Extract base URL from script tag or fallback to auto-detection
   */
  function getBaseUrl(scriptTag) {
    // Try to get from script src attribute
    if (scriptTag && scriptTag.src) {
      const srcUrl = new URL(scriptTag.src);
      return `${srcUrl.protocol}//${srcUrl.host}`;
    }

    // Fallback to auto-detection
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://letterflow.vercel.app'; // Replace with your actual production domain
  }

  /**
   * Initialize the form with the given key
   */
  function init(key) {
    if (!key) {
      console.error('Letterflow Form Error: No form key provided');
      return;
    }

    // Clear any previous timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Set loading timeout
    loadingTimeout = setTimeout(() => {
      showError('The form is taking too long to load. Please try again later.');
    }, LOADING_TIMEOUT);

    formKey = key;

    // Try to find or create the container
    formContainer = document.getElementById(`letterflow-form-${key}`);

    if (!formContainer) {
      // Create the container if it doesn't exist and insert it at the script location
      formContainer = document.createElement('div');
      formContainer.id = `letterflow-form-${key}`;

      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.insertBefore(formContainer, scriptTag.nextSibling);
      } else {
        document.body.appendChild(formContainer);
      }
    }

    // Show loading state
    formContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; background-color: #f9fafb; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="width: 40px; height: 40px; border: 3px solid #e5e7eb; border-radius: 50%; border-top-color: #3b82f6; animation: letterflow-spinner 1s linear infinite;"></div>
        <p style="margin-top: 1rem; color: #6b7280;">Loading form...</p>
      </div>
      <style>
        @keyframes letterflow-spinner {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    // Load form configuration
    fetchFormConfig(key);
  }

  /**
   * Fetch form configuration from the API with retries
   */
  function fetchFormConfig(key, retry = 0) {
    retryCount = retry;

    fetch(`${baseUrl}/api/public/forms/${key}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load form: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        formConfig = data;
        renderForm();

        // Clear loading timeout
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }

        // Record view
        recordView(key);
      })
      .catch(error => {
        console.error('Error fetching form config:', error);

        if (retryCount < MAX_RETRIES) {
          // Retry with exponential backoff
          setTimeout(() => {
            fetchFormConfig(key, retryCount + 1);
          }, RETRY_DELAY * Math.pow(2, retryCount));
        } else {
          showError('Failed to load form configuration. Please try again later.');

          // Clear loading timeout
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }
        }
      });
  }

  /**
   * Record a form view
   */
  function recordView(key) {
    fetch(`${baseUrl}/api/public/forms/${key}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referrer: document.referrer || 'direct',
        ua: navigator.userAgent,
      }),
    }).catch(error => {
      // Silent fail - this is just analytics
      console.warn('Failed to record form view:', error);
    });
  }

  /**
   * Render the form with the loaded configuration
   */
  function renderForm() {
    if (!formContainer || !formConfig) return;

    // Create iframe to load the form
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/embed/forms/${formKey}`;
    iframe.style.width = '100%';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('title', formConfig.name || 'Subscription Form');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-popups');
    iframe.onload = adjustIframeHeight;

    // Add iframe to container
    formContainer.innerHTML = '';
    formContainer.appendChild(iframe);

    // Set up message listener for iframe communication
    window.addEventListener('message', handleIframeMessage);
  }

  /**
   * Handle messages from the iframe
   */
  function handleIframeMessage(event) {
    // Validate origin for security
    if (event.origin !== baseUrl) return;

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      // Handle different message types
      switch (data.type) {
        case 'letterflow:resize':
          if (data.formKey === formKey) {
            const iframe = formContainer.querySelector('iframe');
            if (iframe) {
              iframe.style.height = `${data.height}px`;
            }
          }
          break;

        case 'letterflow:submitted':
          if (data.formKey === formKey) {
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            }
          }
          break;

        case 'letterflow:error':
          if (data.formKey === formKey) {
            showError(data.message || 'An error occurred with the form');
          }
          break;
      }
    } catch (e) {
      // Not a valid JSON message, ignore
      console.warn('Received invalid message:', e);
    }
  }

  /**
   * Adjust iframe height to fit content
   */
  function adjustIframeHeight() {
    const iframe = formContainer.querySelector('iframe');
    if (!iframe) return;

    // Send message to iframe to get its height
    iframe.contentWindow.postMessage(JSON.stringify({
      type: 'letterflow:getHeight',
      formKey: formKey
    }), baseUrl);
  }

  /**
   * Show error message in the form container
   */
  function showError(message) {
    if (!formContainer) return;

    formContainer.innerHTML = `
      <div style="border: 1px solid #f56565; border-radius: 4px; padding: 1rem; background-color: #fff5f5; color: #c53030; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <p style="margin: 0; font-weight: 500;">Letterflow Form Error</p>
        <p style="margin: 0.5rem 0 0;">${message}</p>
        <button onclick="window.lf('reload', '${formKey}')" style="margin-top: 0.75rem; background-color: #e53e3e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">Try Again</button>
      </div>
    `;
  }

  /**
   * Show success message
   */
  function showSuccess(message) {
    if (!formContainer) return;

    formContainer.innerHTML = `
      <div style="border-radius: 4px; padding: 2rem; background-color: #f0fff4; color: #22543d; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: #48bb78; color: white; border-radius: 50%; margin: 0 auto 1rem; font-size: 1.5rem;">✓</div>
        <p style="margin: 0; font-weight: 500;">${message}</p>
      </div>
    `;
  }

  /**
   * Handle form submission
   */
  function submitForm(formData) {
    if (!formKey) {
      console.error('Letterflow Form Error: No form key available');
      return;
    }

    // Show loading state
    if (formContainer) {
      formContainer.innerHTML += `
        <div id="letterflow-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255, 255, 255, 0.8); display: flex; align-items: center; justify-content: center; z-index: 100;">
          <div style="width: 40px; height: 40px; border: 3px solid #e5e7eb; border-radius: 50%; border-top-color: #3b82f6; animation: letterflow-spinner 1s linear infinite;"></div>
        </div>
      `;
    }

    fetch(`${baseUrl}/api/public/forms/${formKey}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(data => {
        // Remove loading overlay
        const overlay = document.getElementById('letterflow-overlay');
        if (overlay) {
          overlay.remove();
        }

        if (data.error) {
          showError(data.error);
          return;
        }

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          showSuccess(data.message || 'Thank you for subscribing!');
        }
      })
      .catch(error => {
        // Remove loading overlay
        const overlay = document.getElementById('letterflow-overlay');
        if (overlay) {
          overlay.remove();
        }

        showError('Failed to submit form. Please try again.');
        console.error('Error submitting form:', error);
      });
  }

  /**
   * Auto-initialize the form if data-form-key is present
   */
  function autoInit() {
    if (scriptTag && scriptTag.dataset.formKey) {
      init(scriptTag.dataset.formKey);
    }
  }

  // Define the global letterflow object with extended functionality
  window.lf = function (command, ...args) {
    switch (command) {
      case 'init':
        init(args[0]);
        break;
      case 'submit':
        submitForm(args[0]);
        break;
      case 'reload':
        init(args[0]);
        break;
      case 'version':
        return '1.1.0';
      default:
        console.error(`Letterflow Form Error: Unknown command "${command}"`);
    }
  };

  // Check if there are any queued commands
  if (Array.isArray(window.lf.q)) {
    for (let i = 0; i < window.lf.q.length; i++) {
      window.lf(...window.lf.q[i]);
    }
    // Clear the queue
    window.lf.q = [];
  }

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    setTimeout(autoInit, 0);
  }
})(); 