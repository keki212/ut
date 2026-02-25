  // =========================
  // Utilidades y estructura
  // =========================

  const $ = sel => document.querySelector(sel);
  const codigoEvalucion = '';

  const el = (tag, attrs={}, ...children) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==='class') n.className=v;
      else if(k==='html') n.innerHTML = v;
      else if(k.startsWith('on') && typeof v === 'function') n.addEventListener(k.substring(2),v);
      else n.setAttribute(k,v);
    });
    children.forEach(c=> n.appendChild(typeof c==='string'?document.createTextNode(c):c));
    
    return n;
  };
  

  // Fecha de ejecución por defecto = hoy
  (function setToday(){
    const d = new Date();
    const iso = d.toISOString().slice(0,10);
    $('#fechaEjec').value = iso;
  })();

  // Generador de select 1..5
  const makeSelect15 = (id) => {
    const s = el('select',{id, required:true});
    s.appendChild(el('option',{value:''},'Seleccione...'));
    const labels = {1:'1 – Deficiente',2:'2 – Insuficiente',3:'3 – Aceptable',4:'4 – Bueno',5:'5 – Sobresaliente'};
    for(let i=1;i<=5;i++){
      s.appendChild(el('option',{value:String(i)},labels[i]));
    }
    return s;
  };

  // =========================
  // Cuestionarios
  // =========================
  // Para LAB y PROD_SERV todos los ítems tienen el mismo peso.
  // Para PROF, la 2.2.1 pesa 10% y se reparte el 90% restante entre las demás.

  // Codigo objeto antiguo:
  /*

  const Q = {
    LAB: [
      { group:'2.1 CUMPLIMIENTO', items:[
        { code:'2.1.1', text:'El laboratorio cumplió con las fechas acordadas para el servicio?' },
        { code:'2.1.2', text:'El laboratorio cumplió con las fechas acordadas para la entrega de informes?' },
      ]},
      { group:'2.2 CALIDAD', items:[
        { code:'2.2.1', text:'¿Son confiables los resultados del laboratorio?' },
        { code:'2.2.2', text:'¿Está acreditado por la ONAC, IDEAM o cualquier organismo autorizado? (Puede anexar copia de la resolución)', attach:true },
      ]},
      { group:'2.3 SEGURIDAD Y SALUD EN EL TRABAJO', items:[
        { code:'2.3.1', text:'Demostró cumplimiento de la normatividad en materia de seguridad y salud en el trabajo? * Según matriz de reevaluación.' },
      ]},
      { group:'2.4 GESTIÓN AMBIENTAL', items:[
        { code:'2.4.1', text:'Demostró cumplimiento de la normatividad en materia ambiental?' },
      ]},
    ],

    PROD_SERV: [
      { group:'2.1 CUMPLIMIENTO', items:[
        { code:'2.1.1', text:'El producto o servicio cumple con las especificaciones solicitadas.' },
        { code:'2.1.2', text:'Cumplió con la entrega/prestación de acuerdo con las fechas acordadas.' },
      ]},
      { group:'2.2 CALIDAD', items:[
        { code:'2.2.1', text:'En caso de utilizar garantías, ¿fue con calidad y oportunidad?' },
        { code:'2.2.2', text:'¿Resolvió quejas presentadas con calidad y oportunidad?' },
        { code:'2.2.3', text:'¿Prestó un servicio más allá del deber? Proactividad y valor agregado.' },
      ]},
      { group:'2.3 SEGURIDAD Y SALUD EN EL TRABAJO', items:[
        { code:'2.3.1', text:'Demostró cumplimiento en SST? * Según matriz. * Si no aplica, calificar 5.', na:true },
      ]},
      { group:'2.4 GESTIÓN AMBIENTAL', items:[
        { code:'2.4.1', text:'Demostró cumplimiento en materia ambiental? * Según matriz. * Si no aplica, calificar 5.', na:true },
      ]},
    ],

    PROF: [
      { group:'2.1 CUMPLIMIENTO', items:[
        { code:'2.1.1', text:'Mantiene al día su carpeta de correspondencia en el sistema de gestión documental.' },
        { code:'2.1.2', text:'Da cumplimiento y participación oportuna en las comunicaciones.' },
        { code:'2.1.3', text:'Orienta, colabora y ayuda a los miembros de la organización en su área.' },
      ]},
      { group:'2.2 CALIDAD', items:[
        { code:'2.2.1', text:'Entrega oportunamente los informes a su cargo.', weightFixed:0.10 }, // 10% del total
        { code:'2.2.2', text:'Presenta conceptos técnicos oportunos, efectivos y con argumentos suficientes.' },
        { code:'2.2.3', text:'Presenta conceptos y aportes tabulados, organizados, con estructura documental y técnica.' },
        { code:'2.2.4', text:'Asiste puntualmente a reuniones y comités citados.' },
        { code:'2.2.5', text:'Atendió observaciones, quejas y/o reclamos en función de sus servicios.' },
        { code:'2.2.6', text:'Atendió PQRS, siendo oportuna y efectiva. * Si no hubo quejas, colocar calificación más alta.', na:true },
      ]},
      { group:'2.3 SEGURIDAD Y SALUD EN EL TRABAJO', items:[
        { code:'2.3.1', text:'Demostró cumplimiento de la normatividad en SST.' },
      ]},
      { group:'2.4 GESTIÓN AMBIENTAL', items:[
        { code:'2.4.1', text:'Demostró cumplimiento de la normatividad ambiental.' },
      ]},
    ],
  };

  */

  
  // Código actualizado con pesos específicos por ítem (para cálculo más preciso y flexible)

  const Q = {
  LAB: [
    { group: '2.1 CUMPLIMIENTO', items: [
      { code: '2.1.1', text: 'El laboratorio cumplió con las fechas acordadas para el servicio?', weight: 0.15 }, // 15%
      { code: '2.1.2', text: 'El laboratorio cumplió con las fechas acordadas para la entrega de informes?', weight: 0.15 }, // 15%
    ]},
    { group: '2.2 CALIDAD', items: [
      { code: '2.2.1', text: '¿Son confiables los resultados del laboratorio?', weight: 0.15 }, // 20%
      { code: '2.2.2', text: '¿Está acreditado por la ONAC, IDEAM o cualquier organismo autorizado? (Puede anexar copia de la resolución)', attach: true, weight: 0.20 }, // 20%
    ]},
    { group: '2.3 SEGURIDAD Y SALUD EN EL TRABAJO', items: [
      { code: '2.3.1', text: 'Demostró cumplimiento de la normatividad en materia de seguridad y salud en el trabajo? * Según matriz de reevaluación.', weight: 0.20 }, // 20%
    ]},
    { group: '2.4 GESTIÓN AMBIENTAL', items: [
      { code: '2.4.1', text: 'Demostró cumplimiento de la normatividad en materia ambiental?', weight: 0.15 }, // 15%
    ]},
  ],

  PROD_SERV: [
    { group: '2.1 CUMPLIMIENTO', items: [
      { code: '2.1.1', text: 'El producto o servicio cumple con las especificaciones solicitadas.', weight: 0.15 }, // 15%
      { code: '2.1.2', text: 'Cumplió con la entrega/prestación de acuerdo con las fechas acordadas.', weight: 0.15 }, // 15%
    ]},
    { group: '2.2 CALIDAD', items: [
      { code: '2.2.1', text: 'En caso de utilizar garantías, ¿fue con calidad y oportunidad?', weight: 0.15 }, // 15%
      { code: '2.2.2', text: '¿Resolvió quejas presentadas con calidad y oportunidad?', weight: 0.15 }, // 15%
      { code: '2.2.3', text: '¿Prestó un servicio más allá del deber? Proactividad y valor agregado.', weight: 0.15 }, // 15%
    ]},
    { group: '2.3 SEGURIDAD Y SALUD EN EL TRABAJO', items: [
      { code: '2.3.1', text: 'Demostró cumplimiento en SST? * Según matriz. * Si no aplica, calificar 5.', na: true, weight: 0.10 }, // 10%
    ]},
    { group: '2.4 GESTIÓN AMBIENTAL', items: [
      { code: '2.4.1', text: 'Demostró cumplimiento en materia ambiental? * Según matriz. * Si no aplica, calificar 5.', na: true, weight: 0.15 }, // 15%
    ]},
  ],

  PROF: [
    { group: '2.1 CUMPLIMIENTO', items: [
      { code: '2.1.1', text: 'Mantiene al día su carpeta de correspondencia en el sistema de gestión documental.', weight: 0.10 }, // 10%
      { code: '2.1.2', text: 'Da cumplimiento y participación oportuna en las comunicaciones.', weight: 0.10 }, // 10%
      { code: '2.1.3', text: 'Orienta, colabora y ayuda a los miembros de la organización en su área.', weight: 0.10 }, // 10%
    ]},
    { group: '2.2 CALIDAD', items: [
      { code: '2.2.1', text: 'Entrega oportunamente los informes a su cargo.', weight: 0.10 }, // 10% (aumentado)
      { code: '2.2.2', text: 'Presenta conceptos técnicos oportunos, efectivos y con argumentos suficientes.', weight: 0.10 }, // 10%
      { code: '2.2.3', text: 'Presenta conceptos y aportes tabulados, organizados, con estructura documental y técnica.', weight: 0.10 }, // 10%
      { code: '2.2.4', text: 'Asiste puntualmente a reuniones y comités citados.', weight: 0.05 }, // 5%
      { code: '2.2.5', text: 'Atendió observaciones, quejas y/o reclamos en función de sus servicios.', weight: 0.10 }, // 10%
      { code: '2.2.6', text: 'Atendió PQRS, siendo oportuna y efectiva. * Si no hubo quejas, colocar calificación más alta.', na: true, weight: 0.10 }, // 10%
    ]},
    { group: '2.3 SEGURIDAD Y SALUD EN EL TRABAJO', items: [
      { code: '2.3.1', text: 'Demostró cumplimiento de la normatividad en SST.', weight: 0.10 }, // 10%
    ]},
    { group: '2.4 GESTIÓN AMBIENTAL', items: [
      { code: '2.4.1', text: 'Demostró cumplimiento de la normatividad ambiental.', weight: 0.10 }, // 10%
    ]},
  ],
};


  // Render dinámico del cuestionario
  const cont = $('#cuestionario');

// render cuestionario antiguo
/*
 function renderCuestionario(tipo){
    cont.innerHTML = '';
    const blocks = Q[tipo];

    // Calcular pesos
    // Por defecto: pesos iguales a cada ítem.
    // Para PROF: 2.2.1 = 10%, el resto reparte 90%.
    let totalItems = 0;
    blocks.forEach(b => totalItems += b.items.length);

    let weights = {}; // code -> peso (0..1)
    if(tipo === 'PROF'){
      let fixedCode = '2.2.1';
      const fixedWeight = 0.10;
      const nRest = totalItems - 1;
      const restWeight = (1 - fixedWeight) / nRest;
      blocks.forEach(b => {
        b.items.forEach(it=>{
          weights[it.code] = (it.code===fixedCode) ? fixedWeight : restWeight;
        });
      });
    }else{
      const w = 1/totalItems;
      blocks.forEach(b => b.items.forEach(it=> weights[it.code]=w));
    }

    // Construcción del DOM
    blocks.forEach(b => {
      const wrap = el('div',{class:'q-block'});
      wrap.appendChild(el('p',{class:'q-title'}, b.group));
      b.items.forEach(it=>{
        const row = el('div',{class:'q-item'});
        const left = el('div',{}, 
          el('div',{}, `${it.code} — ${it.text}`),
          el('div',{class:'weight'}, `Peso: ${(weights[it.code]*100).toFixed(1)}%`)
        );
        const sel = makeSelect15(`q_${it.code.replaceAll('.','_')}`);
        sel.dataset.code = it.code;
        sel.dataset.weight = String(weights[it.code]);

        // Opción "No aplica" en algunos ítems (automatiza calificación 5)
        const right = el('div',{class:'na'});
        if(it.na){
          const naId = `na_${it.code.replaceAll('.','_')}`;
          const na = el('input',{type:'checkbox',id:naId});
          const lbl = el('label',{for:naId},'No aplica');
          na.addEventListener('change',()=>{
            if(na.checked){ sel.value = '5'; sel.disabled = true; }
            else{ sel.disabled = false; sel.value = ''; }
          });
          right.append(na,lbl);
        }

        row.append(left, sel, right);

        // Adjuntos (solo informativo, no se almacena)
        if(it.attach){
          const uploader = el('input',{type:'file',accept:'.pdf,.jpg,.jpeg,.png'});
          uploader.style.maxWidth = '260px';
          const attachWrap = el('div',{style:'grid-column:1 / -1; display:flex; gap:10px; align-items:center; margin-top:6px;'});
          attachWrap.append(
            el('span',{class:'hint'},'Anexo opcional: '),
            uploader
          );
          row.appendChild(attachWrap);
        }

        wrap.appendChild(row);
      });
      cont.appendChild(wrap);
    });

    // Guardar pesos actuales para referencia en botón "Ver Pesos"
    cont.dataset.weights = JSON.stringify(weights);
  }
*/


  function renderCuestionario(tipo) {
  cont.innerHTML = '';
  const blocks = Q[tipo];
  
  // Set the evaluation code
  const evalCode = setCodigoEvaluacion(tipo);
  $('#codigoEvalucion').textContent = evalCode;

  // Validar que la suma de pesos sea 1 (100%)
  let totalWeight = 0;
  blocks.forEach(b => {
    b.items.forEach(it => {
      totalWeight += it.weight || 0;
    });
  });
  
  // Si la suma no es 1, mostrar advertencia (opcional)
  if (Math.abs(totalWeight - 1) > 0.01) {
    console.warn(`La suma de pesos para ${tipo} es ${totalWeight}, debería ser 1`);
  }

  // Construcción del DOM
  blocks.forEach(b => {
    const wrap = el('div', { class: 'q-block' });
    wrap.appendChild(el('p', { class: 'q-title' }, b.group));
    
    b.items.forEach(it => {
      const row = el('div', { class: 'q-item' });
      const left = el('div', {},
        el('div', {}, `${it.code} — ${it.text}`),
        el('div', { class: 'weight' }, `Peso: ${((it.weight || 0) * 100).toFixed(1)}%`)
      );
      
      const sel = makeSelect15(`q_${it.code.replaceAll('.', '_')}`);
      sel.dataset.code = it.code;
      sel.dataset.weight = String(it.weight || 0);

      // Opción "No aplica" en algunos ítems (automatiza calificación 5)
      const right = el('div', { class: 'na' });
      if (it.na) {
        const naId = `na_${it.code.replaceAll('.', '_')}`;
        const na = el('input', { type: 'checkbox', id: naId });
        const lbl = el('label', { for: naId }, 'No aplica');
        na.addEventListener('change', () => {
          if (na.checked) { 
            sel.value = '5'; 
            sel.disabled = true; 
          } else { 
            sel.disabled = false; 
            sel.value = ''; 
          }
        });
        right.append(na, lbl);
      }

      row.append(left, sel, right);

      // Adjuntos (solo informativo, no se almacena)
      if (it.attach) {
        const uploader = el('input', { type: 'file', accept: '.pdf,.jpg,.jpeg,.png' });
        uploader.style.maxWidth = '260px';
        const attachWrap = el('div', { style: 'grid-column:1 / -1; display:flex; gap:10px; align-items:center; margin-top:6px;' });
        attachWrap.append(
          el('span', { class: 'hint' }, 'Anexo opcional: '),
          uploader
        );
        row.appendChild(attachWrap);
      }

      wrap.appendChild(row);
    });
    cont.appendChild(wrap);
  });

  // Guardar pesos actuales para referencia
  const weights = {};
  blocks.forEach(b => {
    b.items.forEach(it => {
      weights[it.code] = it.weight || 0;
    });
  });
  cont.dataset.weights = JSON.stringify(weights);
}

  // Inicial
  renderCuestionario($('#tipoProveedor').value);
  $('#tipoProveedor').addEventListener('change', e => renderCuestionario(e.target.value));

  // =========================
  // Cálculo y gráfica
  // =========================

  function getCalificacionCategoria(pct){
    // A: 90-100; B: 80-<90; C: 50-<80; D:<50
    if(pct >= 90) return 'A';
    if(pct >= 80) return 'B';
    if(pct >= 50) return 'C';
    return 'D';
  }

  function accionesPorCategoria(cat){
    switch(cat){
      case 'A':
        return ['Divulgar los resultados al proveedor.'];
      case 'B':
        return [
          'Colocar en observaciones las fallas específicas del proveedor.',
          'Divulgar resultados e informar puntos con baja calificación; instar a su mejora.'
        ];
      case 'C':
        return [
          'Colocar en observaciones las fallas específicas del proveedor.',
          'Divulgar resultados e informar que debe presentarse un plan de acción para abordar los puntos bajos y realizar seguimiento.'
        ];
      case 'D':
        return [
          'Colocar en observaciones las fallas específicas del proveedor.',
          'Divulgar resultados e informar hasta cuándo se le solicitarán productos/servicios; suspender y buscar nuevo proveedor.'
        ];
    }
    return [];
  }

  function calcularPorcentaje(){
    const selects = cont.querySelectorAll('select[id^="q_"]');
    let missing = [];
    let total = 0;
    selects.forEach(s=>{
      if(s.disabled) return total += (5/5) * parseFloat(s.dataset.weight); // No aplica => 5
      if(!s.value) missing.push(s.id);
    });
    if(missing.length){
      alert('Por favor califique todos los ítems (o marque "No aplica" donde corresponda).');
      return null;
    }
    total = 0;
    selects.forEach(s=>{
      const val = Number(s.value);
      const w = parseFloat(s.dataset.weight);
      total += (val/5)*w;
    });
    const pct = Math.round(total*1000)/10; // una decimal
    return pct;
  }

  function drawGauge(pct){
    const c = document.getElementById('gauge');
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    // limpiar
    ctx.clearRect(0,0,W,H);

    // barra fondo
    const x=20, y=H/2-14, w=W-40, h=28;
    // fondo
    ctx.fillStyle = '#f3f4f6';
    roundRect(ctx, x, y, w, h, 14, true, false);

    // relleno según pct
    const fillW = Math.max(0, Math.min(w, w*(pct/100)));
    ctx.fillStyle = (pct>=80)? '#16a34a' : (pct>=50? '#f59e0b' : '#dc2626');
    roundRect(ctx, x, y, fillW, h, 14, true, false);

    // línea umbral 80%
    const thrX = x + w*0.8;
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([6,6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(thrX, y-14);
    ctx.lineTo(thrX, y+h+14);
    ctx.stroke();
    ctx.restore();

    // textos auxiliares
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui';
    ctx.fillText('0%', x, y+h+20);
    ctx.fillText('80% (mínimo)', thrX-24, y-20);
    ctx.fillText('100%', x+w-28, y+h+20);
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke){
    if (w<2*r) r=w/2;
    if (h<2*r) r=h/2;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
    if(fill) ctx.fill();
    if(stroke) ctx.stroke();
  }

  function setCodigoEvaluacion(tipo){
    switch(tipo){
      case 'LAB': return 'CS-FO-305';
      case 'PROD_SERV': return 'CS-FO-308';
      case 'PROF': return 'CS-FO-309';
      default: return '';
    }
  }

  // Botones
  $('#btnCalcular').addEventListener('click', ()=>{
    console.log('Calculando porcentaje...');
    const porcentaje = calcularPorcentaje();
    if(porcentaje===null) return;

    // Mostrar gráfica
    $('#resultado').style.display = 'block';
    drawGauge(porcentaje);

    const cat = getCalificacionCategoria(porcentaje);
    const acciones = accionesPorCategoria(cat);
    $('#pctTxt').textContent = `Cumplimiento: ${porcentaje.toFixed(1)}%`;
    $('#catTxt').innerHTML = `Clasificación: <span class="badge ${cat}">${cat}</span>`;
    $('#accionTxt').innerHTML = `<strong>Acciones sugeridas:</strong><ul>${acciones.map(a=>`<li>${a}</li>`).join('')}</ul>`;
  });

  $('#btnMostrarPesos').addEventListener('click', ()=>{
    const weights = JSON.parse(cont.dataset.weights||'{}');
    const lines = Object.entries(weights).map(([code,w])=> `${code}: ${(w*100).toFixed(2)}%`);
    alert('Pesos actuales por ítem:\n\n' + lines.join('\n'));
  });

  $('#btnLimpiar').addEventListener('click', ()=>{
    if(!confirm('¿Desea limpiar toda la evaluación y comenzar de nuevo?')) return;
    // Limpiar datos del proveedor y evaluador
    ['empresa','nit','direccion','ciudad','tel','email','fechaIni','fechaUlt','observaciones','evalNombre','evalCargo','evalArea']
      .forEach(id => { const n = document.getElementById(id); if(n) n.value=''; });
    // Reset cuestionario (re-render)
    renderCuestionario($('#tipoProveedor').value);
    // Reset resultado
    $('#resultado').style.display = 'none';
  });