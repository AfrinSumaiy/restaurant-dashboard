<?php
/*
| ------------------------------------------------------------------------------
| Yak Cms - PHP MVC Framework
| ------------------------------------------------------------------------------
| @framework		YakCms
| @version			1.0
| @author			Haibbus P Subbiah
| @vendor			Peace Soft Technologies
| @source			http://peacesoft.in
| @contact			support@peacesoft.in, subbiah@peacesoft.in
| @mobile			+91 9487944120
| ------------------------------------------------------------------------------
|
| This is Open Source framework. You can made any modifications in source files.
| If you have any queries? please send to support@peacesoft.in
| Thankyou for using.
| ------------------------------------------------------------------------------
*/

//ini_set("memory_limit","-1");

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 100');    // cache for 1 day
}

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 100');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description,Authorization-Token');

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers:        {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}


use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


define('YAK', '0.0.1');            	 # the framework version

define('ROOT', dirname(__FILE__));   # the framework root

define('WEBROOT', str_replace('/index.php', '', $_SERVER['SCRIPT_NAME']));

define('APP_PATH', 'App');

date_default_timezone_set('Asia/Kolkata');

require 'vendor/autoload.php';
require APP_PATH . '/TheYak/Core.php';
 
$dotenv = new Symfony\Component\Dotenv\Dotenv();
$dotenv->load(__DIR__.'/.env');

$request = Request::createFromGlobals();

App\TheYak\Core::register();

App\TheYak\Core::defineEnv();

$app = new App\TheYak\Core();

$router = new Buki\Router\Router([
	'base_folder' => $_ENV['BASE_PATH'],
	//'main_method' => 'main',
	'paths' => [
	  'controllers' => APP_PATH . '/Controllers',
	  'middlewares' =>   APP_PATH . '/Middlewares',
	],
	'namespaces' => [
	  //'controllers' => '',
	  //'middlewares' => '',
	]
]);

$urlList = ($request->server->get('REDIRECT_URL'));

$urlList = str_replace($request->server->get('BASE_PATH'),'', $urlList);
$urlList = ltrim($urlList,'/');
$urlList = rtrim($urlList,'/');
$modules = [];

require APP_PATH . '/router.php';

require APP_PATH . '/mobile_router.php';

require APP_PATH . '/website_router.php';

class RouterGroup {

   public static function makeModuleRoutes($rout, $modules, $browserRoute)
   {
       foreach($modules as $jj=>$_module)
       {
          if(str_contains($browserRoute, $jj))
          {
             if(is_array($_module[0])){
                foreach($_module as $_i=>$_v)
                {
                   if(is_array($_v) && sizeof($_v)==2){
                      $_path = $jj.'/'.$_v[0];
                      self::makeRoute($rout, $_path, $_v[1]);
                   }
                }
             }else{
                self::makeRoute($rout, $jj, $_module[0]);
             }
          }
       }
   }
  
   public static function makeRoute($rout, $path, $controller)
   {
      return $rout->controller($path, $controller);
   }

}


/* To run router groups */
// to loop modules array
foreach($modules as $k=>$module)
{
   // to check group exist in modules array
   if(array_key_exists('group', $module))
   {
      // if group exist then check url pattern exist in the group
      if(str_contains($urlList, $module['group']))
      {         
         $beforeMiddleware = [];
         if(array_key_exists('before', $module)) $beforeMiddleware = ['before' => $module['before']];
         $GLOBALS['modules'] = $module['modules'];
         $GLOBALS['urlList'] = $urlList;

         $router->group($module['group'], function($r){
            $_modules = $GLOBALS['modules'];
            $_urlList = $GLOBALS['urlList'];
            $GLOBALS['modules'] = '';
            $GLOBALS['urlList'] = '';
            // loop available modules in group
            RouterGroup::makeModuleRoutes($r, $_modules, $_urlList);
            /*
            foreach($_modules as $jj=>$_module)
            {
               if(str_contains($_urlList, $jj))
               {
                  if(is_array($_module[0])){
                     foreach($_module as $_i=>$_v)
                     {
                        if(is_array($_v) && sizeof($_v)==2){
                           $_path = $jj.'/'.$_v[0];
                           $r->controller($_path, $_v[1]);
                        }
                     }
                  }else{
                     //$r->controller($jj, $_module[0]);
                     RouterGroup::makeRoute($r, $jj, $_module[0]);
                  }
               }
            }*/
         },$beforeMiddleware);
         
      }
      
   }
   else
   {
      if(is_array($module) && array_key_exists('modules', $module))
      {
         RouterGroup::makeModuleRoutes($router, $module['modules'], $urlList);
      }
   }
}

/*
$router->error(function(Request $request, Response $response, Exception $exception) {
   echo json_encode([
      'line'         => $exception->getLine(),
      'file'         => $exception->getFile(),
      'message'      => $exception->getMessage(),
   ]);
 });*/

/* To run router groups */
//var_dump($router);
$router->run();