/* Evolucion - Influences
 * By John Garavito
 */
$(document).ready(function(){
  (function(){
    
    this.figures = $.extend(this.figures, {
      concept: function(ctx, parent, p, title, figureStyle){
        var bb, op, width, height;
        var fig             = figures.figure(ctx);
        var titleStyle      = utils.clone(style.title);
        var rectangleStyle  = utils.clone(style.rectangle);
        
        titleStyle['fill']  = figureStyle.color || style.title['fill']; 
        rectangleStyle['stroke-dasharray'] = figureStyle.dasharray_rec || style.rectangle['stroke-dasharray'];
        
        fig.p = {x: p.x, y: p.y};
        fig.push(
          ctx.r.text(fig.p.x, fig.p.y, title).attr(titleStyle)
        );
        
        bb = fig[0].getBBox();
        op = {x: bb.x - 2, y: bb.y -1};
        width = bb.width + 4;
        height = bb.height + 2;
        
        fig.push(
          ctx.r.rect(op.x, op.y, width, height, 4).attr(rectangleStyle),
          ctx.r.image('/static/icons/close.png',  op.x + width - 12, op.y - 12, 24, 24),
          ctx.r.image('/static/icons/info.png', op.x + width -36, op.y - 12, 24, 24)
        );
        
        fig[0].toFront();
        fig[2].toFront();
        fig[3].toFront();
        fig[2].hide();
        fig[3].hide();
        
        for(var i=0; i<2; i++){
          fig[i].attr({ cursor: "move"});
        }
        
        fig.changeTitle = function(title){
          var bb, op, width, height;
          
          this[0].attr('text', title);
          
          bb = fig[0].getBBox();
          op = {x: bb.x - 2, y: bb.y -1};
          width = bb.width + 4;
          height = bb.height + 2;
          
          this[1].attr('x', op.x);
          this[1].attr('y', op.y);
          this[1].attr('width', width);
          this[1].attr('height', height);
          this[1].transform('');
          
          this[2].attr('x', op.x + width - 12);
          this[2].attr('y', op.y - 12);
          this[2].transform('');
          
        };
        fig.getBorder = function(){
          var bb, op, width, height;
          bb = this[0].getBBox();
          op = {x: bb.x - 2, y: bb.y -1};
          width = bb.width + 4;
          height = bb.height + 2;
          
          this.border = [ ["M", op.x, op.y], 
                          ["H", op.x + width], 
                          ["V", op.y + height],
                          ["H", op.x],
                          ["V", op.y]];
          return this.border;
        };
        fig.hover(
          function(){
            fig[2].show();
            fig[3].show();
          },
          function(){
            fig[2].hide();
            fig[3].hide();
          }
        );
        utils.parentReference(fig, parent);
        return fig;
      }
    });
    
    this.Concept = Element.extend({
      init: function(ctx, p, title){
        this._super(ctx);
        
        this.type         = "concept";
        var idx           = this.ctx.idx[this.type]++;
        
        this.id           = "concept-"+idx;
        this.title        = title || "Concepto "+idx;
        this.name         = evo.utils.textToVar(this.title);
        
        this.units        = " ";
        this.list         = this.ctx.list.concept;
        this.figGenerator = figures.concept;
        this.figure(p);
        this.integrateCtx();
      },
      changeUnits: function(units){
        this.units = units;
      },
      figure: function(p){
        this.fig = this.figGenerator(this.ctx, this, p, this.title, {});
        this.border = this.fig.getBorder();
        for(var i=0; i<2; i++){
          this.fig[i].drag(this.moveFig, this.start, this.end);
          this.fig[i].dblclick(this.createTextEditor);
        }
        this.fig[2].click(this.remove);
        this.fig[3].click(this.viewControls);
      }
    });
    
    this.Influences = Editor.extend({
      init: function(){
        this._super(this.initWorkArea());
        
        this.id       = 'inf';
        this.div      = '#influences';
        this.svg      = '#svg-inf';
        this.svgDiv   = '#svg-div-inf';
        this.state    = 'cursor';
        
        this.elements = ['concept', 'clone'];
        this.states   = this.elements.concat(
                        ['cycle', 'material', 'information', 'sector']);
        
        for(var i in this.states){
          this.list[this.states[i]] = {};
          this.idx[this.states[i]]  = 0;
          this.tmp[this.states[i]]  = undefined;
        }
        
        this.defActions();
        this.defineCtx();
        this.activateState(this.state);
      },
      adjust: function(){
        var workAreaHeight = $('.work-area').height();
        
        $('#influences-area .sidebar').height(workAreaHeight);
        var infToolbarHeight = ($('#influences-area .toolbar').outerHeight()||46);        
        $('#language-inf').height(workAreaHeight - infToolbarHeight -2);
        
        var languageWidth = $("#language-inf").width();
        var languageHeight = $("#language-inf").height();
        
        if(languageWidth<=0){ languageWidth = 1024; }
        if(languageHeight<=0){ languageHeight = 768; }
        
        if($('#svg-inf').width()<languageWidth){
          $('#svg-inf').width(languageWidth);
          $('#svg-div-inf').width(languageWidth);
        }
        if($('#svg-inf').height()<languageHeight){
          $('#svg-inf').height(languageHeight);
          $('#svg-div-inf').height(languageHeight);
        }
      },
      
      defActions: function(){
        $(this.svgDiv).mouseenter(function(e){
          var p = inf.pointer.getPosition(e);
          
          switch(inf.state){
            case 'concept': {
              if(inf.tmp.concept){
                inf.tmp.concept.remover();
                inf.tmp.concept = undefined;
              }
              inf.tmp.concept = figures.concept(inf, undefined, p, "Concepto "+inf.idx['concept'], {});
              break;
            }
            case 'material': {
              if(inf.tmp.relma){
                inf.tmp.relma.remover();
                inf.tmp.relma = undefined;
              }
              inf.tmp.relma = new figRelMa(inf, undefined, p);
              break;
            }
            case 'information': {
              if(inf.tmp.relin){
                inf.tmp.relin.remover();
                inf.tmp.relin = undefined;
              }
              inf.tmp.relin = new figRelIn(inf, undefined, p);
              break;
            }
            case 'cycle': {
              if(inf.tmp.ciclo){
                inf.tmp.ciclo.remover();
                inf.tmp.ciclo = undefined;
              }
              inf.tmp.ciclo = new figCiclo(inf, undefined, p, "Ciclo "+ inf.idx['ciclo'], "der", "pos");
              break;
            }
            case 'clone': {
              if(inf.tmp.copia){
                inf.tmp.copia.remover();
                inf.tmp.copia = undefined;
              }
              inf.tmp.copia = new figCopia(inf, undefined, p);
              break;
            }
            case 'sector': {
              if(inf.tmp.seinf){
                inf.tmp.seinf.remover();
                inf.tmp.seinf = undefined;
              }
              inf.tmp.seinf = new figSecto(inf, undefined, p, undefined, "Sector "+inf.idx['seinf']);
              break;
            }
          }
        });
        $(this.svgDiv).mouseleave(function(e){
          switch(inf.state){
            case 'concept': {
              if(inf.tmp.concept){
                inf.tmp.concept.remove();
                inf.tmp.concept = undefined;
              }
              break;
            }
            case 'material': {
              if(inf.tmp.relma){
                inf.tmp.relma.remove();
                inf.tmp.relma = undefined;
              }
              break;
            }
            case 'information': {
              if(inf.tmp.relin){
                inf.tmp.relin.remove();
                inf.tmp.relin = undefined;
              }
              break;
            }
            case 'cycle': {
              if(inf.tmp.ciclo){
                inf.tmp.ciclo.remove();
                inf.tmp.ciclo = undefined;
              }
              break;
            }
            case 'clone': {
              if(inf.tmp.copia){
                inf.tmp.copia.remove();
                inf.tmp.copia = undefined;
              }
              break;
            }
            case 'sector': {
              if(inf.tmp.seinf){
                inf.tmp.seinf.remove();
                inf.tmp.seinf = undefined;
              }
              break;
            }
          }
        });
        $(this.svgDiv).mousemove(function(e){
          var p = inf.pointer.getPosition(e);
          switch(inf.state){
            case 'concept': {
              if(inf.tmp.concept){
                inf.tmp.concept.moveToPoint(p);            
              }
              break;
            }
            case 'material': {
              if(inf.tmp.relma){
                inf.tmp.relma.moveToPoint(p);
              }
              break;
            }
            case 'information': {
              if(inf.tmp.relin){
                inf.tmp.relin.moveToPoint(p);
              }
              break;
            }
            case 'cycle': {
              if(inf.tmp.ciclo){
                inf.tmp.ciclo.moveToPoint(p);
              }
              break;
            }
            case 'clone': {
              if(inf.tmp.copia){
                inf.tmp.copia.moveToPoint(p);
              }
              break;
            }
            case 'sector': {
              if(inf.tmp.seinf){
                inf.tmp.seinf.moveToPoint(p);
              }
              break;
            }
          }
        });
        $(this.svgDiv).click(function(e){
          var p = inf.pointer.getPosition(e);
          var alpha;
          
          switch(inf.state){
            case 'concept': {
              if(inf.tmp.concept){
                var c = new Concept(inf, p);
                inf.list.concept[c.id] = c;
                inf.activateState('cursor');
                inf.tmp.concept.remove();
                inf.tmp.concept = undefined;
              }
              break;          
            }
            case 'material': {
              var el = inf.existeElPt(p);
              var relac = inf.tmp.relma;
              if(el){
                p = inf.detPunEnPath(el.border, p);
                alpha = inf.detAngEnPath(el.border, p);
                if(relac.estado == 'inicial' && el.connec['aceOri']){
                  relac.ori = el;
                  relac.actSegPun(inf, p, alpha);
                }
                else if(relac.estado == 'extendido' && el.connec['aceDes']){
                  var noEsMismo = false;
                  var noExRelac = false;
                    
                  if(relac.ori.id != el.id){
                    noEsMismo = true;
                  }
                  noExRelac = !el.exisRelDes(relac.ori.id);
                  
                  if(noEsMismo && noExRelac){
                    relac.p[3] = p;
                    
                    var rm = new RelMa(inf, relac.p, relac.ori, el);
    
                    inf.list.relma[rm.id] = rm;
                    
                    inf.activarModo('curso-inf');
                    inf.tmp.relma.remove();
                    inf.tmp.relma = undefined;
                  }
                }
              }
              break;
            }
            case 'information': {
              var el = inf.existeElPt(p);
              var relac = inf.tmp.relin;
              if(el){
                p = inf.detPunEnPath(el.border, p);
                alpha = inf.detAngEnPath(el.border, p);
                if(relac.estado == 'inicial' && el.connec['aceOri']){
                  relac.ori = el;
                  relac.actSegPun(inf, p, alpha);
                }
                else if(relac.estado == 'extendido' && el.connec['aceDes']){
                  var noEsMismo = false;
                  var noExRelac = false;
                    
                  if(relac.ori.id != el.id){
                    noEsMismo = true;
                  }
                  noExRelac = !el.exisRelDes(relac.ori.id);
                  
                  if(noEsMismo && noExRelac){
                    relac.p[3] = p;
                    
                    var ri = new RelIn(inf, relac.p, relac.ori, el);
    
                    inf.list.relin[ri.id] = ri;
                    
                    inf.activarModo('curso-inf');
                    inf.tmp.relin.remove();
                    inf.tmp.relin = undefined;
                  }
                }
              }
              break;
            }
            case 'cycle': {
              var ci = new Ciclo(inf, p);
              inf.list.ciclo[ci.id] = ci;
              
              inf.activarModo('curso-inf');
              inf.tmp.ciclo.remove();
              inf.tmp.ciclo = undefined;
              break;
            }
            case 'clone': {
              var el = inf.existeElPt(p);
              if(el){
                var cp = new Copia(inf, p, el);
                inf.list.copia[cp.id] = cp;
                
                inf.activarModo('curso-inf');
                inf.tmp.copia.remove();
                inf.tmp.copia = undefined;
              }
              break;
            }
            case 'sector': {
              var se = new Secto(inf, p);
              inf.list.seinf[se.id] = se;
              
              inf.activarModo('curso-inf');
              inf.tmp.seinf.remove();
              inf.tmp.seinf = undefined;
              break;
            }
          }
        });
      },
      defineCtx: function(){
        this.panel.ctx = this;
        this.pointer.ctx = this;
        this.sector.ctx = this;
      },
      initWorkArea: function(){
        var workAreaHeight = $('.work-area').height();
        
        this.initToolbar();
        
        $('#influences-area .sidebar').height(workAreaHeight);
        var infToolbarHeight = ($('#influences-area .toolbar').outerHeight() || 46);
        var languageWidth  = ((Math.floor($('.work-area').width()*0.83)-2) || 1024);
        var languageHeight = workAreaHeight - infToolbarHeight -2;
        $('#language-inf').height(languageHeight);
        
        var svgDiv = $('#svg-div-inf');
        svgDiv.width(languageWidth);
        svgDiv.height(languageHeight);
        
        var panel = svgDiv[0];
        var r = Raphael(panel, languageWidth, languageHeight);
        
        $('#svg-div-inf svg').attr('id', 'svg-inf');
        
        return r;
      },
      initToolbar: function(){
        $('#influences-area .toolbar .btn-group [title]').tooltip({ container: 'body' });
        
        $('#influences-area .toolbar .btn').hover(
          function() {  var name = this.id;
                        if(name.substring(0,name.indexOf('-')) != inf.state){
                          $(this).removeClass('btn-primary'); 
                          $(this).addClass('btn-info');
                        }
                     },
          function() {  var name = this.id;
                        if(name.substring(0,name.indexOf('-')) != inf.state){
                          $(this).removeClass('btn-info');
                          $(this).addClass('btn-primary'); 
                        }
                     }
        );
        
        $('#influences-area .toolbar .btn').click(function(){
          var name = $(this).attr('id');
          inf.activateState(name.substring(0,name.indexOf('-')));
        });
      },
      integrateControls: function(el){
        var nameItemsCont;
        
        switch(el.type){
          case 'concept': {
            nameItemsCont = '#concept-items';
            break;
          }
          case 'cycle': {
            nameItemsCont = '#cycles-items';
            break;
          }
          case 'material': {
            nameItemsCont = '#material-items';
            break;
          }
          case 'information': {
            nameItemsCont = '#information-items';
            break;
          }
          case 'sector': {
            nameItemsCont = '#sectors-items';
            break;
          }
        }
        if(nameItemsCont && el.id && el.title){
          var html =
            "<div id='"+el.id+"-item' class='panel panel-default'>"+
              "<div class='panel-heading'>"+
                "<a data-toggle='collapse' data-parent='"+nameItemsCont+"' href='#"+el.id+"-item-body'>"+
                  "<h4 class='panel-title'>"+
                    el.title+
                  "</h4>"+
                "</a>"+
              "</div>"+
              "<div id='"+el.id+"-item-body' class='panel-collapse collapse'>"+
                "<div class='panel-body'>";
          
          if(el.description){
            html +=
                "<div class='form-group'>"+
                  "<label for='"+el.id+"-description' class='control-label'>"+
                    "Descripción"+
                  "</label>"+
                  "<textarea id='"+el.id+"-description' name='description' class='form-control' maxlength='200' cols='40' rows='5' placeholder='Descripción'>"+
                  "</textarea>"+
                "</div>";
          }
          if(el.units){
            html += 
                "<div class='form-group'>"+
                  "<label for='"+el.id+"-units' class='control-label'>Unidades</label>"+
                  "<input id='"+el.id+"-units' type='text' name='title' class='form-control' maxlength='200' placeholder='Unidades'>"+
                "</div>";
          }
          if(el.orie){
            html += "<div id='"+el.id+"_item_conte_ori' "+
                "class='eleContTit'"+
                ">Orientaci&oacute;n.</div>"+
                "<form>"+
                  "<div id='"+el.id+"_item_conte_ori_radio_set'>"+
                    "<input type='radio' id='"+el.id+"_item_conte_ori_pos_IR' name='"+el.id+"_item_conte_ori_IR' value='der' checked='checked'/>"+
                    "<label for='"+el.id+"_item_conte_ori_pos_IR'>Derecha</label>"+
                    "<input type='radio' id='"+el.id+"_item_conte_ori_neg_IR' name='"+el.id+"_item_conte_ori_IR' value='izq' />"+
                    "<label for='"+el.id+"_item_conte_ori_neg_IR'>Izquierda</label>"+
                  "</div>"+
                "</form>";
          }
          if(el.real){
            html += "<div id='"+el.id+"_item_conte_rea' "+
                "class='eleContTit'"+
                ">Realimentaci&oacute;n.</div>"+
                "<form>"+
                  "<div id='"+el.id+"_item_conte_rea_radio_set'>"+
                    "<input type='radio' id='"+el.id+"_item_conte_rea_pos_IR' name='"+el.id+"_item_conte_rea_IR' value='pos' checked='checked'/>"+
                    "<label for='"+el.id+"_item_conte_rea_pos_IR'>Positiva</label>"+
                    "<input type='radio' id='"+el.id+"_item_conte_rea_neg_IR' name='"+el.id+"_item_conte_rea_IR' value='neg' />"+
                    "<label for='"+el.id+"_item_conte_rea_neg_IR'>Negativa</label>"+
                  "</div>"+
                "</form>";
          }
          html +=
                "</div>"+
              "</div>"+
            "</div>";
          
          $(nameItemsCont).append(html);
          
          $('#'+el.id+'_item_tit').click(function(){
            $('#'+el.id+'_item_conte').toggle();
            return false;
          });
          if(el.desc){
            $('#'+el.id+'_item_conte_desc').css('width', '75px');
            $('#'+el.id+'_item_conte_desc_TA').change(function(){         
              el.camDesc($(this).val());          
            });
          }
          if(el.unid){
            $('#'+el.id+'_item_conte_uni').css('width', '60px');
            $('#'+el.id+'_item_conte_uni_IT').change(function(){
              el.camUnids($(this).val());
            });
          }
          if(el.orie){
            $("#"+el.id+"_item_conte_ori_radio_set").buttonset();
            $("#"+el.id+"_item_conte_ori_radio_set label span").css('padding', '0.1em 0.3em');
            $("input:radio[name='"+el.id+"_item_conte_ori_IR']").change(function(){
              el.camOrientacion($(this).val());
            });
          }
          if(el.real){
            $("#"+el.id+"_item_conte_rea_radio_set").buttonset();
            $("#"+el.id+"_item_conte_rea_radio_set label span").css('padding', '0.1em 0.3em');
            $("input:radio[name='"+el.id+"_item_conte_rea_IR']").change(function(){
              el.camRealimentacion($(this).val());
            });
          }
        }
      },
      deleteControls: function(el){
        $('#'+el.id+'-item').remove();
      }
    });
  })();
});