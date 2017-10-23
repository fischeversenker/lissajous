

(function() {
  const freq1_slider = document.querySelector('#freq1');
  const freq2_slider = document.querySelector('#freq2');
  const freq3_slider = document.querySelector('#freq3');
  const setup_name = document.querySelector('#name');
  const setup_save = document.querySelector('#save');
  const setup_load = document.querySelector('#load');
  const setup_select = document.querySelector('#select');
  const width = 800;
  const height = 800;
  let freqs;
  let val1, val2, val3;
  const scale = 2;
  let scene;
  let camera;
  let renderer;
  let cube;
  
  let last_pos = null;

  function update() {
  	requestAnimationFrame( update );

    let dotGeometry = new THREE.Geometry();

    for(let i = 0; i < 10; i++) {
      val1 = (Date.now() / 100000) * freqs.freq1 / scale;
      val2 = (Date.now() / 100000) * freqs.freq2 / scale;
      val3 = (Date.now() / 100000) * freqs.freq3 / scale;
      let pos = new THREE.Vector3();
      pos.x = 15/2 * Math.cos(val1);
      pos.y = 15/2 * Math.cos(val2);
      pos.z = 15/2 * Math.cos(val3);
      if ( last_pos != null ) {
        dotGeometry.vertices.push(new THREE.Vector3( pos.x, pos.y, pos.z));
      }
      last_pos = pos;
    }

    let dotMaterial = new THREE.PointsMaterial( { size: 0.1, sizeAttenuation: true, color: 'white' } );
    let dots = new THREE.Points( dotGeometry, dotMaterial );
    scene.add( dots );

    camera.position.x = Math.cos(Date.now() / 4000) * 30;
    camera.position.z = Math.sin(Date.now() / 4000) * 30;
    camera.lookAt(new THREE.Vector3(0,0,0));
  	renderer.render( scene, camera );
  }
  
  function clear() {
    while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
    }
  }

  function setupSliders() {
    let freq1_ls = localStorage.getItem('freq1');
    let freq2_ls = localStorage.getItem('freq2');
    let freq3_ls = localStorage.getItem('freq3');
    if (freq1_ls != null ) {
      freq1_slider.value = parseInt(localStorage.getItem('freq1'), 10);
    }
    if (freq2_ls != null ) {
      freq2_slider.value = parseInt(localStorage.getItem('freq2'), 10);
    }
    if (freq3_ls != null ) {
      freq3_slider.value = parseInt(localStorage.getItem('freq3'), 10);
    }
    freqs = {
      freq1: freq1_slider.value,
      freq2: freq2_slider.value,
      freq3: freq3_slider.value
    };
    freq1_slider.dataset.val = freqs.freq1;
    freq2_slider.dataset.val = freqs.freq2;
    freq3_slider.dataset.val = freqs.freq3;
    freq1_slider.dataset.name = 'X-Freq';
    freq2_slider.dataset.name = 'Y-Freq';
    freq3_slider.dataset.name = 'Z-Freq';
    
    function registerFreqListener(el, name) {
      el.addEventListener('input', function() {
        clear();
        let freq = this.value;
        this.dataset.val = this.value;
        localStorage.setItem(name, freq);
        freqs[name] = freq;
      });
    }
    
    registerFreqListener(freq1_slider, 'freq1');
    registerFreqListener(freq2_slider, 'freq2');
    registerFreqListener(freq3_slider, 'freq3');

  }
  
  function setupLoadSave() {
    
    // react to save click
    setup_save.addEventListener('click', function() {
      if (setup_name.value != '') {
        let curr_setup = {name: setup_name.value, freqs: freqs};
        addToLS(curr_setup);
        addToSelect(setup_name.value);
        setup_name.value = '';
      }
    });
    
    // load existing setups
    let setups_ls = localStorage.getItem('setups');
    
    // add default
    if ( getSetupFromLS('tulip (default)') == null) {
      let s = {name: 'tulip (default)', freqs: {freq1: 400, freq2: 700, freq3: 1200}};
      addToLS(s)
    }
  
    let setups = JSON.parse(localStorage.getItem('setups'));
    for ( let i = 0; i < setups.length; i++ ) {
      addToSelect(setups[i].name);
    }
    
    // react to load click
    setup_load.addEventListener('click', function() {
      var e = document.getElementById("select");
      var name = e.options[e.selectedIndex].text;
      let setup_ls = getSetupFromLS(name);
      if (setup_ls != null) {
        clear();
        freqs = setup_ls.freqs;
        freq1_slider.value = freqs.freq1;
        freq2_slider.value = freqs.freq2;
        freq3_slider.value = freqs.freq3;
        freq1_slider.dataset.val = freqs.freq1;
        freq2_slider.dataset.val = freqs.freq2;
        freq3_slider.dataset.val = freqs.freq3;
      }
    });
    
    function addToLS(s) {
      let setups = [s];
      let prev_setups_ls = localStorage.getItem('setups');
      if ( prev_setups_ls != null ) {
        let prev_setups = JSON.parse(prev_setups_ls);
        setups = setups.concat(prev_setups);
      }
      localStorage.setItem('setups', JSON.stringify(setups));
    }
    
    function addToSelect(option) {
      let node = document.createElement("OPTION");
      let textnode = document.createTextNode(option);
      node.appendChild(textnode);
      setup_select.appendChild(node); 
    }
  }
  
  function getSetupFromLS(name) {
    let setups_ls = localStorage.getItem('setups');
    if (setups_ls != null) {
      let setups = JSON.parse(localStorage.getItem('setups'));
      for ( let i = 0; i < setups.length; i++ ) {
        if ( setups[i].name == name ) {
          return setups[i];
        }
      }
    }
    return null;
  }

  function init() {
    setupSliders();
    setupLoadSave();
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    camera.position.z = 20;
    
    window.addEventListener( 'resize', onWindowResize, false );

    
    window.setTimeout(update, 100);
  }
  
  function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  init();
})();