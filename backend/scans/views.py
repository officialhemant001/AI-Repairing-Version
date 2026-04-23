from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Scan
from ai_engine.inference import predict

class ScanUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image = request.FILES.get('image')

        result = predict(image)

        scan = Scan.objects.create(
            user=request.user,
            image=image,
            result=result
        )

        return Response(result)