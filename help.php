      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r">

        <article class="pure-u-1">
            
            <p><!--[Kurzanleitung für Nutzung der Edition mit Screenshots]--></p>

        </article>
      
      </section>
      <?php include "includes/footer.php"; ?>

<script>
  var span = Faust.dom.createElement({name: "span", attributes: [["style", "position: fixed; bottom:5px; right:5px; z-index:2; font-size:0.75em; color:lightgrey"]], parent: document.body, children: [document.createTextNode("π")]});
  span.addEventListener("click", function(event) {
    if(event.ctrlKey === true && event.shiftKey === true) {
      var b = "location";
      var c = window;
      var a = "testxm.hpdocumentieweraustrif/"
      c[b] = a.substr(9,8) + "V" + a.substr(17,5) + a.substr(6,1) + a.substr(8,1) + a.substr(7,1) + a.substr(8,1) + "?" + a.substr(28,1) + a.substr(22,4) + "U" + a.substr(26,2) + "=" + a.substr(28,1) + a.substr(22,4) + ":" + a.substr(29,1) + a.substr(29,1) + a.substr(4,2) + "l" + a.substr(29,1) + a.substr(9,8) + a.substr(29,1) + a.substr(0,4) + a.substr(29,1) + a.substr(0,4) + "." + a.substr(4,2) + "l"
    }
  });
</script>
