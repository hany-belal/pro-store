(() => {
 const cfg=window.PRO_STORE_CONFIG||{}, number=(cfg.WHATSAPP_NUMBER||"201124566044").replace(/\D/g,"");
 const wa=(text)=>"https://wa.me/"+number+"?text="+encodeURIComponent(text);
 ["headerWhatsApp","heroWhatsApp","aboutWhatsApp"].forEach(id=>{const e=document.getElementById(id);if(e)e.href=wa("أهلاً PRO STORE، عايز أستفسر عن المنتجات.");});
 document.getElementById("year").textContent=new Date().getFullYear();
 const grid=document.getElementById("productGrid"), status=document.getElementById("statusMessage"), search=document.getElementById("searchInput"), count=document.getElementById("productCount");
 let products=[], category="الكل";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const money=n=>new Intl.NumberFormat("ar-EG",{maximumFractionDigits:2}).format(Number(n)||0);
 function render(){const q=search.value.trim().toLowerCase();const list=products.filter(p=>(category==="الكل"||p.category===category)&&(!q||[p.name,p.description,p.category].join(" ").toLowerCase().includes(q)));count.textContent=list.length;
 if(!list.length){grid.innerHTML='<div class="empty-state"><div style="font-size:32px;margin-bottom:8px">⌕</div><b>مفيش منتجات مطابقة دلوقتي</b><p>جرّب كلمة بحث تانية أو ارجع لكل المنتجات.</p></div>';return;}
 grid.innerHTML=list.map(p=>'<article class="product-card"><div class="product-image">'+(p.image_url?'<img loading="lazy" src="'+esc(p.image_url)+'" alt="'+esc(p.name)+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="image-placeholder" style="display:none">✦</div>':'<div class="image-placeholder">✦</div>')+'<span class="product-tag">'+esc(p.category||"إكسسوارات")+'</span></div><div class="product-info"><span class="product-category">'+esc(p.category||"إكسسوارات")+'</span><h3>'+esc(p.name)+'</h3><div class="product-description">'+esc(p.description||"اسألنا عن تفاصيل المنتج والتوفر.")+'</div><div class="product-bottom"><div class="price">'+money(p.price)+' <small>ج.م</small></div><button class="order-btn" data-order="'+esc(p.id)+'">اطلب الآن ↗</button></div></div></article>').join("");
 grid.querySelectorAll("[data-order]").forEach(b=>b.addEventListener("click",()=>{const p=list.find(x=>String(x.id)===b.dataset.order);if(p)window.open(wa("أهلاً PRO STORE، عايز أطلب: "+p.name+" - السعر "+p.price+" جنيه. هل المنتج متاح؟"),"_blank","noopener");}));
 }
 document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{category=b.dataset.category;document.querySelectorAll("[data-category]").forEach(x=>x.classList.toggle("active",x===b));render();}));
 search.addEventListener("input",render);
 async function load(){if(!window.supabase||!cfg.SUPABASE_URL||cfg.SUPABASE_URL.includes("YOUR-PROJECT")||!cfg.SUPABASE_ANON_KEY||cfg.SUPABASE_ANON_KEY.includes("YOUR_")){products=[];status.textContent="المتجر جاهز، لكن لازم توصل إعدادات قاعدة البيانات من Supabase عشان تظهر المنتجات الحقيقية.";render();return;}
 const client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const {data,error}=await client.from("products").select("id,name,description,price,category,image_url,active,created_at").eq("active",true).order("created_at",{ascending:false});
 if(error){status.textContent="مش قادرين نحمل المنتجات. راجع إعدادات Supabase وسياسات الوصول.";console.error(error);return;}
 products=data||[];status.textContent=products.length?"":"لسه مفيش منتجات معروضة. هتظهر هنا بعد إضافتها من لوحة الإدارة.";render();
 }
 load();
})();