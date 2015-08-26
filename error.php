      <?php include "includes/header.php"; ?>
      <div class="main-content-container">
      <center style="width:50%; margin:2em auto;">
        <?php
          $status = filter_input (INPUT_GET, 'status', FILTER_SANITIZE_NUMBER_INT);
          $msg = array();
          
          switch ($status) {
            case 400:
               $msg['title'] = $status .': Bad Request';
               $msg['text'] = ' - Die Anfrage-Nachricht ist fehlerhaft aufgebaut.';
              break;

            case 401:
               $msg['title'] = $status .': Unauthorized';
               $msg['text'] = ' - Die Authentifizierung schlug fehl.';
              break;

            case 403:
               $msg['title'] = $status .': Forbidden';
               $msg['text'] = ' - Sie sind nicht berechtigt diese Ressource anzusehen.';
              break;

            case 404:
               $msg['title'] = $status .': Not Found';
               $msg['text'] = ' - Die angeforderte Ressource wurde nicht gefunden.';
              break;

            case 500:
               $msg['title'] = $status .': Internal Server Error';
               $msg['text'] = '';
              break;
            
            default:
               $msg['title'] = 'Unbekannter Fehler';
               $msg['text'] = '';
              break;
          }
        ?>
        <div class="pure-alert pure-alert-danger">
          <b><i class="icon-warning-sign"></i> <?php echo $msg['title']; ?></b> <?php echo $msg['text']; ?>
        </div>
        <p><a href="/">Startseite</a></p>
      </center>
      </div>
      <?php include "includes/footer.php"; ?>
